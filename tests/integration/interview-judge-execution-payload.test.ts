import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// #608: dynamic judge definitions — private worker execution payloads.
//
// Runs against a DISPOSABLE LOCAL Supabase stack (`supabase start`), never
// production, and self-skips when SUPABASE_* env vars are absent. Proves the
// atomic enqueue RPC persists (a) the learner-readable submission row with the
// new version identity + definition source and (b) the raw source/fixtures in a
// SEPARATE table that the authenticated learner can neither read nor write —
// only the service role (worker) may. This is the security boundary #608 adds.

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ready = Boolean(url && anonKey && serviceKey);
const suite = ready ? describe : describe.skip;

const PASSWORD = "Test-Password-123!";
const CONTENT_VERSION = "44444444-4444-4444-8444-444444444444";

function anonClient(): SupabaseClient {
  return createClient(url!, anonKey!, { auth: { persistSession: false, autoRefreshToken: false } });
}

function submissionPayload(submissionId: string) {
  return {
    submission_id: submissionId,
    interview_session_id: null,
    problem_id: "user.item.integration-608",
    problem_version: 1,
    content_version_id: CONTENT_VERSION,
    definition_source: "user",
    mode: "practice",
    task_kind: "compile_and_run",
    compiler: "gcc",
    standard: "c++20",
    source_hash: "a".repeat(64),
    source_bytes: 42,
    source_version: 1,
    assistance_used: false,
    prior_solution_exposed: false,
    visible_total: 1,
    hidden_total: 1
  };
}

const executionPayload = {
  source_text: "int main(){ return 0; }",
  worker_tests: [{ id: "case-1", name: "v", hidden: false, category: "visible", fixtureHash: "h1" }],
  fixtures: [{ testId: "case-1", stdin: "1\n", expectedStdout: "1\n" }]
};

suite("interview judge execution payload boundary (#608)", () => {
  let service: SupabaseClient;
  let learner: SupabaseClient;
  let learnerId = "";
  const submissionId = randomUUID();

  beforeAll(async () => {
    service = createClient(url!, serviceKey!, { auth: { persistSession: false, autoRefreshToken: false } });
    const email = `judge-608-${Date.now()}@example.test`;
    const created = await service.auth.admin.createUser({ email, password: PASSWORD, email_confirm: true });
    if (created.error) throw created.error;
    learnerId = created.data.user!.id;
    learner = anonClient();
    const signIn = await learner.auth.signInWithPassword({ email, password: PASSWORD });
    if (signIn.error) throw signIn.error;
  });

  afterAll(async () => {
    if (learnerId) {
      await service.from("interview_judge_submissions").delete().eq("submission_id", submissionId);
      await service.auth.admin.deleteUser(learnerId);
    }
  });

  it("enqueues the submission row and private payload atomically", async () => {
    const { data, error } = await learner.rpc("enqueue_interview_judge_submission", {
      p_submission: submissionPayload(submissionId),
      p_execution: executionPayload
    });
    expect(error).toBeNull();
    expect(data).toBe("queued");

    // The learner reads their own submission row (own-row RLS) with the new
    // version identity + definition source.
    const row = await learner
      .from("interview_judge_submissions")
      .select("definition_source,content_version_id,user_id")
      .eq("submission_id", submissionId)
      .single();
    expect(row.error).toBeNull();
    expect(row.data).toMatchObject({
      definition_source: "user",
      content_version_id: CONTENT_VERSION,
      user_id: learnerId
    });

    // The private payload exists — visible only to the service role.
    const payload = await service
      .from("interview_judge_execution_payloads")
      .select("source_text")
      .eq("submission_id", submissionId)
      .single();
    expect(payload.error).toBeNull();
    expect(payload.data?.source_text).toBe(executionPayload.source_text);
  });

  it("hides the raw execution payload from the authenticated learner", async () => {
    const read = await learner
      .from("interview_judge_execution_payloads")
      .select("source_text")
      .eq("submission_id", submissionId);
    // RLS with no policy yields zero rows (never the raw source), not the payload.
    expect(read.data ?? []).toEqual([]);
  });

  it("forbids the learner from writing execution payloads", async () => {
    const insert = await learner.from("interview_judge_execution_payloads").insert({
      submission_id: submissionId,
      source_text: "malicious",
      worker_tests: [],
      fixtures: []
    });
    expect(insert.error).not.toBeNull();

    const update = await learner
      .from("interview_judge_execution_payloads")
      .update({ source_text: "tampered" })
      .eq("submission_id", submissionId);
    expect(update.error ?? update.data).toBeTruthy();
    // The service-role view of the payload is unchanged.
    const check = await service
      .from("interview_judge_execution_payloads")
      .select("source_text")
      .eq("submission_id", submissionId)
      .single();
    expect(check.data?.source_text).toBe(executionPayload.source_text);
  });
});
