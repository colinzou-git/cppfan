import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ready = Boolean(url && anonKey && serviceKey);
const suite = ready ? describe : describe.skip;
const password = "Test-Password-123!";
const nativeItem = "cpp.program_basics.structure.lesson";

function anonymousClient(): SupabaseClient {
  return createClient(url!, anonKey!, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

suite("Terminal attempt atomic idempotency (#668)", () => {
  let service: SupabaseClient;
  let learner: SupabaseClient;
  let other: SupabaseClient;
  let learnerId = "";
  let otherId = "";
  let knownSkillId = "";

  async function createUser(label: string) {
    const email = `terminal-668-${label}-${Date.now()}-${crypto.randomUUID()}@example.test`;
    const created = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (created.error || !created.data.user) {
      throw created.error ?? new Error("user creation failed");
    }
    const client = anonymousClient();
    const signIn = await client.auth.signInWithPassword({ email, password });
    if (signIn.error) throw signIn.error;
    return { client, id: created.data.user.id };
  }

  function args(terminalAttemptId: string, overrides: Partial<Record<string, unknown>> = {}) {
    return {
      p_terminal_attempt_id: terminalAttemptId,
      p_learning_item_id: nativeItem,
      p_content_version_id: null,
      p_milestone_index: null,
      p_source_code: "int main(){return 0;}",
      p_run_status: "terminal_exited",
      p_compile_output: "",
      p_stdout: "ok",
      p_stderr: "",
      p_skill_ids: [knownSkillId],
      p_event_metadata: { provider: "execution-service", simulated: false },
      ...overrides
    };
  }

  beforeAll(async () => {
    service = createClient(url!, serviceKey!, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const skill = await service
      .from("learning_item_skills")
      .select("skill_id")
      .eq("learning_item_id", nativeItem)
      .limit(1)
      .single();
    if (skill.error || !skill.data?.skill_id) throw skill.error ?? new Error("seed skill missing");
    knownSkillId = skill.data.skill_id;
    const a = await createUser("a");
    const b = await createUser("b");
    learner = a.client;
    learnerId = a.id;
    other = b.client;
    otherId = b.id;
  });

  afterAll(async () => {
    if (!service) return;
    await Promise.all(
      [learnerId, otherId]
        .filter(Boolean)
        .map((id) => service.auth.admin.deleteUser(id).catch(() => undefined))
    );
  });

  it("inserts one attempt and one event, then returns already_recorded", async () => {
    const terminalAttemptId = crypto.randomUUID();
    const first = await learner.rpc("record_terminal_code_attempt", args(terminalAttemptId));
    expect(first.error).toBeNull();
    expect(first.data?.[0]?.status).toBe("recorded");

    const duplicate = await learner.rpc("record_terminal_code_attempt", args(terminalAttemptId));
    expect(duplicate.error).toBeNull();
    expect(duplicate.data?.[0]?.status).toBe("already_recorded");

    const attempts = await learner
      .from("code_lab_attempts")
      .select("id")
      .eq("terminal_attempt_id", terminalAttemptId);
    const events = await learner
      .from("skill_events")
      .select("id")
      .contains("metadata", { terminalAttemptId });
    expect(attempts.data).toHaveLength(1);
    expect(events.data).toHaveLength(1);
  });

  it("serializes two concurrent retries into recorded + already_recorded", async () => {
    const terminalAttemptId = crypto.randomUUID();
    const results = await Promise.all([
      learner.rpc("record_terminal_code_attempt", args(terminalAttemptId)),
      learner.rpc("record_terminal_code_attempt", args(terminalAttemptId))
    ]);
    expect(results.every((result) => result.error === null)).toBe(true);
    expect(results.map((result) => result.data?.[0]?.status).sort()).toEqual([
      "already_recorded",
      "recorded"
    ]);
  });

  it("uses user-scoped uniqueness for the same UUID", async () => {
    const terminalAttemptId = crypto.randomUUID();
    const [a, b] = await Promise.all([
      learner.rpc("record_terminal_code_attempt", args(terminalAttemptId)),
      other.rpc("record_terminal_code_attempt", args(terminalAttemptId))
    ]);
    expect(a.data?.[0]?.status).toBe("recorded");
    expect(b.data?.[0]?.status).toBe("recorded");
  });

  it("stores user-item history with NULL event item and ignores unknown skills", async () => {
    const terminalAttemptId = crypto.randomUUID();
    const userItem = `user.item.${crypto.randomUUID()}`;
    const result = await learner.rpc(
      "record_terminal_code_attempt",
      args(terminalAttemptId, {
        p_learning_item_id: userItem,
        p_skill_ids: [knownSkillId, "unknown.skill.tag"]
      })
    );
    expect(result.error).toBeNull();
    const attempt = await learner
      .from("code_lab_attempts")
      .select("learning_item_id")
      .eq("terminal_attempt_id", terminalAttemptId)
      .single();
    const events = await learner
      .from("skill_events")
      .select("skill_id,learning_item_id,metadata")
      .contains("metadata", { terminalAttemptId });
    expect(attempt.data?.learning_item_id).toBe(userItem);
    expect(events.data).toHaveLength(1);
    expect(events.data?.[0]).toMatchObject({
      skill_id: knownSkillId,
      learning_item_id: null
    });
    expect(events.data?.[0]?.metadata).toMatchObject({ itemId: userItem });
  });

  it("creates no learning event for a simulated/mock call with no skills", async () => {
    const terminalAttemptId = crypto.randomUUID();
    const result = await learner.rpc(
      "record_terminal_code_attempt",
      args(terminalAttemptId, {
        p_skill_ids: [],
        p_event_metadata: { provider: "mock", simulated: true }
      })
    );
    expect(result.data?.[0]?.status).toBe("recorded");
    const events = await learner
      .from("skill_events")
      .select("id")
      .contains("metadata", { terminalAttemptId });
    expect(events.data).toEqual([]);
  });

  it("keeps legacy NULL terminal identities valid and distinct IDs distinct", async () => {
    const legacy = await service.from("code_lab_attempts").insert({
      user_id: learnerId,
      terminal_attempt_id: null,
      learning_item_id: nativeItem,
      source_code: "legacy",
      language: "cpp",
      run_status: "success",
      ai_review_requested: false
    });
    expect(legacy.error).toBeNull();

    const ids = [crypto.randomUUID(), crypto.randomUUID()];
    const results = await Promise.all(
      ids.map((id) => learner.rpc("record_terminal_code_attempt", args(id)))
    );
    expect(results.every((result) => result.data?.[0]?.status === "recorded")).toBe(true);
  });
});
