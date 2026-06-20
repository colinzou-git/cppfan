import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ready = Boolean(url && anonKey && serviceKey);
const suite = ready ? describe : describe.skip;
const password = "Test-Password-123!";

function anonymousClient() {
  return createClient(url!, anonKey!, { auth: { autoRefreshToken: false, persistSession: false } });
}

suite("trusted adaptive Goal Evaluation (#267)", () => {
  let service: SupabaseClient;
  let learner: SupabaseClient;
  let other: SupabaseClient;
  let learnerId = "";
  let otherId = "";
  let sessionId = "";

  async function makeLearner(label: string) {
    const email = `evaluation-${label}-${Date.now()}-${crypto.randomUUID()}@example.test`;
    const created = await service.auth.admin.createUser({ email, password, email_confirm: true });
    if (created.error || !created.data.user) throw created.error ?? new Error("user creation failed");
    const client = anonymousClient();
    const signedIn = await client.auth.signInWithPassword({ email, password });
    if (signedIn.error) throw signedIn.error;
    return { client, id: created.data.user.id };
  }

  beforeAll(async () => {
    service = createClient(url!, serviceKey!, { auth: { autoRefreshToken: false, persistSession: false } });
    const a = await makeLearner("a");
    const b = await makeLearner("b");
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

  it("starts one resumable session through a database-selected first item", async () => {
    const submissionId = crypto.randomUUID();
    const started = await learner.rpc("start_goal_evaluation", {
      p_submission_id: submissionId,
      p_algorithm_version: "goal-evaluation-v1",
      p_item_pool_version: 1
    });
    expect(started.error).toBeNull();
    expect(started.data?.[0]?.replayed).toBe(false);
    sessionId = String(started.data?.[0]?.result_session_id);
    const firstItem = String(started.data?.[0]?.result_current_item_id);
    expect(firstItem).toBeTruthy();

    const replay = await learner.rpc("start_goal_evaluation", {
      p_submission_id: submissionId,
      p_algorithm_version: "goal-evaluation-v1",
      p_item_pool_version: 1
    });
    expect(replay.error).toBeNull();
    expect(replay.data?.[0]).toMatchObject({
      result_session_id: sessionId,
      result_current_item_id: firstItem,
      replayed: true
    });

    const refreshed = await learner
      .from("goal_evaluation_sessions")
      .select("current_item_id,question_index,answer_count,algorithm_version,item_pool_version")
      .eq("id", sessionId)
      .single();
    expect(refreshed.data).toMatchObject({ current_item_id: firstItem, question_index: 1, answer_count: 0 });
  });

  it("prevents cross-user access, direct writes, hidden correctness reads, and the retired caller-driven RPC", async () => {
    const hidden = await other.from("goal_evaluation_sessions").select("id").eq("id", sessionId);
    expect(hidden.error).toBeNull();
    expect(hidden.data).toEqual([]);

    const forged = await learner.from("goal_evaluation_responses").insert({
      user_id: learnerId,
      session_id: sessionId,
      sequence_no: 1,
      learning_item_id: "forged",
      choice_id: "forged",
      is_correct: true,
      module_id: "forged",
      primary_skill_id: "forged",
      difficulty_band: 5,
      diagnostic_weight: 3,
      item_type: "multiple_choice"
    });
    expect(forged.error).not.toBeNull();

    const correctness = await learner.from("goal_evaluation_responses").select("is_correct").limit(1);
    expect(correctness.error).not.toBeNull();

    const retiredRpc = await learner.rpc("submit_goal_evaluation_answer", {
      p_session_id: sessionId,
      p_expected_question_index: 1,
      p_choice_id: "forged",
      p_next_item_id: "forged",
      p_model_state: {},
      p_findings: []
    });
    expect(retiredRpc.error).not.toBeNull();
  });

  it("commits exactly 30 unique adaptive answers with idempotency and no learning side effects", async () => {
    const session = await learner
      .from("goal_evaluation_sessions")
      .select("current_item_id")
      .eq("id", sessionId)
      .single();
    let currentItemId = String(session.data?.current_item_id);
    const selected: string[] = [];

    for (let questionIndex = 1; questionIndex <= 30; questionIndex += 1) {
      selected.push(currentItemId);
      const choices = await learner
        .from("learning_item_choices")
        .select("id")
        .eq("learning_item_id", currentItemId)
        .order("order_index");
      expect(choices.error).toBeNull();
      expect(choices.data?.length).toBeGreaterThanOrEqual(2);
      const choiceRows = choices.data ?? [];
      const choiceId = String(choiceRows[questionIndex % choiceRows.length]?.id);
      const submissionId = crypto.randomUUID();
      const answer = await learner.rpc("submit_goal_evaluation_answer", {
        p_session_id: sessionId,
        p_expected_question_index: questionIndex,
        p_submission_id: submissionId,
        p_choice_id: choiceId
      });
      expect(answer.error).toBeNull();
      expect(answer.data?.[0]?.replayed).toBe(false);
      if (questionIndex < 30) {
        expect(answer.data?.[0]?.result_is_correct).toBeNull();
        expect(answer.data?.[0]?.result_status).toBe("active");
        currentItemId = String(answer.data?.[0]?.result_current_item_id);
      } else {
        expect(answer.data?.[0]?.result_status).toBe("completed");
        expect(answer.data?.[0]?.result_current_item_id).toBeNull();
      }

      if (questionIndex === 1) {
        const replay = await learner.rpc("submit_goal_evaluation_answer", {
          p_session_id: sessionId,
          p_expected_question_index: questionIndex,
          p_submission_id: submissionId,
          p_choice_id: choiceId
        });
        expect(replay.error).toBeNull();
        expect(replay.data?.[0]?.replayed).toBe(true);
        const stale = await learner.rpc("submit_goal_evaluation_answer", {
          p_session_id: sessionId,
          p_expected_question_index: questionIndex,
          p_submission_id: crypto.randomUUID(),
          p_choice_id: choiceId
        });
        expect(stale.error?.message).toContain("stale_evaluation_question");
      }
    }

    expect(selected).toHaveLength(30);
    expect(new Set(selected).size).toBe(30);
    const completed = await learner
      .from("goal_evaluation_sessions")
      .select("status,answer_count,findings")
      .eq("id", sessionId)
      .single();
    expect(completed.data?.status).toBe("completed");
    expect(completed.data?.answer_count).toBe(30);
    expect(Array.isArray(completed.data?.findings)).toBe(true);
    expect((completed.data?.findings as unknown[]).length).toBeGreaterThan(0);

    for (const table of ["learning_item_attempts", "review_cards", "review_logs", "skill_events"]) {
      const rows = await learner.from(table).select("*").eq("user_id", learnerId);
      expect(rows.error).toBeNull();
      expect(rows.data, `Evaluation wrote ${table}`).toEqual([]);
    }
  }, 60_000);
});
