import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ready = Boolean(url && anonKey && serviceKey);
const suite = ready ? describe : describe.skip;
const password = "Test-Password-123!";

function anonymousClient() {
  return createClient(url!, anonKey!, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

function target() {
  return [{
    acquisitionContractId: "skill-initial-learning",
    acquisitionContractVersion: 1,
    orderIndex: 0,
    referenceId: "cpp.program_basics.structure",
    source: "manual",
    targetKind: "acquire_skill",
    titleSnapshot: "A minimal C++ program",
    weight: 1
  }];
}

function createArgs(submissionId: string, title: string, end = "2026-06-25") {
  return {
    p_algorithm_version: "study-goals-v1",
    p_end_local_date: end,
    p_learner_note: null,
    p_recommendation_reason: "Authenticated integration coverage.",
    p_recommendation_source: "manual",
    p_start_local_date: "2026-06-19",
    p_submission_id: submissionId,
    p_targets: target(),
    p_timezone: "America/Los_Angeles",
    p_title: title
  };
}

suite("study goal persistence, lifecycle, RLS, and allocation concurrency (#265)", () => {
  let service: SupabaseClient;
  let learner: SupabaseClient;
  let other: SupabaseClient;
  let learnerId = "";
  let otherId = "";
  let goalId = "";

  async function createUser(label: string) {
    const email = `goal-${label}-${Date.now()}-${crypto.randomUUID()}@example.test`;
    const created = await service.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error || !created.data.user) throw created.error ?? new Error("user creation failed");
    const client = anonymousClient();
    const signedIn = await client.auth.signInWithPassword({ email, password });
    if (signedIn.error) throw signedIn.error;
    return { client, id: created.data.user.id };
  }

  beforeAll(async () => {
    service = createClient(url!, serviceKey!, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const a = await createUser("a");
    const b = await createUser("b");
    learner = a.client;
    learnerId = a.id;
    other = b.client;
    otherId = b.id;
  });

  afterAll(async () => {
    if (!service) return;
    await Promise.all([learnerId, otherId].filter(Boolean).map((id) =>
      service.auth.admin.deleteUser(id).catch(() => undefined)
    ));
  });

  it("persists multiple active goals and replays create idempotently", async () => {
    const submissionId = crypto.randomUUID();
    const first = await learner.rpc("create_study_goal", createArgs(submissionId, "Refresh foundations"));
    expect(first.error).toBeNull();
    expect(first.data?.[0]?.replayed).toBe(false);
    goalId = String(first.data?.[0]?.result_goal_id);

    const replay = await learner.rpc("create_study_goal", createArgs(submissionId, "Refresh foundations"));
    expect(replay.error).toBeNull();
    expect(replay.data?.[0]).toMatchObject({ result_goal_id: goalId, replayed: true });

    const second = await learner.rpc(
      "create_study_goal",
      createArgs(crypto.randomUUID(), "Second active goal", "2026-06-19")
    );
    expect(second.error).toBeNull();

    const active = await learner.from("study_goals").select("id,status").eq("status", "active");
    expect(active.error).toBeNull();
    expect(active.data).toHaveLength(2);

    const conflict = await learner.rpc("create_study_goal", createArgs(submissionId, "Changed replay"));
    expect(conflict.error?.message).toContain("idempotency_conflict");
  });

  it("enforces the inclusive 1-30 local-calendar-day duration", async () => {
    const thirtyDays = await learner.rpc(
      "create_study_goal",
      createArgs(crypto.randomUUID(), "Thirty day goal", "2026-07-18")
    );
    expect(thirtyDays.error).toBeNull();

    const thirtyOneDays = await learner.rpc(
      "create_study_goal",
      createArgs(crypto.randomUUID(), "Too long goal", "2026-07-19")
    );
    expect(thirtyOneDays.error).not.toBeNull();
  });

  it("creates immutable revisions and rejects stale competing revisions", async () => {
    const common = {
      ...createArgs(crypto.randomUUID(), "Revised foundations"),
      p_goal_id: goalId,
      p_expected_revision: 1,
      p_learner_note: "Keep the old revision readable."
    };
    const winner = await learner.rpc("revise_study_goal", common);
    expect(winner.error).toBeNull();
    expect(winner.data?.[0]?.result_revision_number).toBe(2);

    const stale = await learner.rpc("revise_study_goal", {
      ...common,
      p_submission_id: crypto.randomUUID(),
      p_title: "Stale competing edit"
    });
    expect(stale.error?.message).toContain("stale_goal_revision");

    const revisions = await learner
      .from("study_goal_revisions")
      .select("revision_number,learner_note")
      .eq("goal_id", goalId)
      .order("revision_number");
    expect(revisions.error).toBeNull();
    expect(revisions.data?.map((row) => row.revision_number)).toEqual([1, 2]);
    expect(revisions.data?.[1]?.learner_note).toBe("Keep the old revision readable.");
  });

  it("isolates all goal-owned rows and rejects direct browser writes", async () => {
    for (const table of [
      "study_goals",
      "study_goal_revisions",
      "study_goal_targets",
      "study_goal_events",
      "study_goal_mutation_receipts",
      "study_goal_daily_allocations"
    ]) {
      const hidden = await other.from(table).select("*").eq("user_id", learnerId);
      expect(hidden.error).toBeNull();
      expect(hidden.data, `${table} leaked across users`).toEqual([]);
    }

    const forged = await learner.from("study_goals").insert({
      user_id: learnerId,
      title: "Forged direct write"
    });
    expect(forged.error).not.toBeNull();

    const crossUserComplete = await other.rpc("complete_study_goal", {
      p_expected_revision: 2,
      p_goal_id: goalId,
      p_reason: "not mine",
      p_submission_id: crypto.randomUUID()
    });
    expect(crossUserComplete.error?.message).toContain("goal_not_found");
  });

  it("serializes Learn Extra allocation and replays the winning request", async () => {
    const revision = await learner
      .from("study_goal_revisions")
      .select("id")
      .eq("goal_id", goalId)
      .eq("revision_number", 2)
      .single();
    const targetRow = await learner
      .from("study_goal_targets")
      .select("id")
      .eq("revision_id", revision.data!.id)
      .single();
    expect(revision.error).toBeNull();
    expect(targetRow.error).toBeNull();

    const submissionIds = [crypto.randomUUID(), crypto.randomUUID()];
    const allocate = (index: number) => learner.rpc("allocate_goal_extra", {
      p_acquisition_contract_version: 1,
      p_acquisition_step_id: `step-${index}`,
      p_action_id: `action-${index}`,
      p_algorithm_version: "daily-new-v1",
      p_destination_id: `item-${index}`,
      p_destination_kind: "learning_item",
      p_expected_daily_plan_version: 0,
      p_goal_id: goalId,
      p_local_plan_date: "2026-06-19",
      p_revision_id: revision.data!.id,
      p_submission_id: submissionIds[index],
      p_target_id: targetRow.data!.id,
      p_timezone: "America/Los_Angeles"
    });
    const results = await Promise.all([allocate(0), allocate(1)]);
    const winnerIndex = results.findIndex((result) => result.error === null);
    const loser = results[1 - winnerIndex];
    expect(winnerIndex).toBeGreaterThanOrEqual(0);
    expect(results[winnerIndex].data?.[0]?.result_daily_plan_version).toBe(1);
    expect(loser.error?.message).toContain("stale_daily_allocation_version");

    const replay = await allocate(winnerIndex);
    expect(replay.error).toBeNull();
    expect(replay.data?.[0]?.replayed).toBe(true);
    expect(replay.data?.[0]?.result_daily_plan_version).toBe(1);
  });

  it("records idempotent complete and reopen lifecycle events without changing revisions", async () => {
    const completeId = crypto.randomUUID();
    const completed = await learner.rpc("complete_study_goal", {
      p_expected_revision: 2,
      p_goal_id: goalId,
      p_reason: "Derived acquisition requirements satisfied.",
      p_submission_id: completeId
    });
    expect(completed.error).toBeNull();
    expect(completed.data?.[0]?.replayed).toBe(false);

    const completeReplay = await learner.rpc("complete_study_goal", {
      p_expected_revision: 2,
      p_goal_id: goalId,
      p_reason: "Derived acquisition requirements satisfied.",
      p_submission_id: completeId
    });
    expect(completeReplay.error).toBeNull();
    expect(completeReplay.data?.[0]?.replayed).toBe(true);

    const reopened = await learner.rpc("reopen_study_goal", {
      p_expected_revision: 2,
      p_goal_id: goalId,
      p_reason: "Learner extended the goal.",
      p_submission_id: crypto.randomUUID()
    });
    expect(reopened.error).toBeNull();

    const goal = await learner.from("study_goals").select("status,current_revision").eq("id", goalId).single();
    expect(goal.data).toMatchObject({ status: "active", current_revision: 2 });
    const events = await learner
      .from("study_goal_events")
      .select("event_type")
      .eq("goal_id", goalId);
    expect(events.data?.map((row) => row.event_type)).toEqual(
      expect.arrayContaining(["created", "revised", "completed", "reopened"])
    );
  });
});
