import { createHash } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ready = Boolean(url && anonKey && serviceKey);
const suite = ready ? describe : describe.skip;
const password = "Test-Password-123!";
const knownSkillId = "cpp.program_basics.structure";

function anonymousClient(): SupabaseClient {
  return createClient(url!, anonKey!, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

suite("authoritative user-lab persistence (#669)", () => {
  let service: SupabaseClient;
  let learner: SupabaseClient;
  let learnerId = "";
  const itemId = `user.item.${crypto.randomUUID()}`;
  const versionOne = crypto.randomUUID();
  const versionTwo = crypto.randomUUID();

  beforeAll(async () => {
    service = createClient(url!, serviceKey!, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const email = `lab-669-${Date.now()}@example.test`;
    const created = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (created.error || !created.data.user) throw created.error ?? new Error("user failed");
    learnerId = created.data.user.id;
    learner = anonymousClient();
    const signIn = await learner.auth.signInWithPassword({ email, password });
    if (signIn.error) throw signIn.error;
  });

  afterAll(async () => {
    if (learnerId) await service.auth.admin.deleteUser(learnerId);
  });

  it("stores and intentionally updates an exact milestone source hash", async () => {
    const firstHash = createHash("sha256").update("source one").digest("hex");
    const secondHash = createHash("sha256").update("source two").digest("hex");
    const write = (hash: string) =>
      learner.from("user_lab_milestone_progress").upsert(
        {
          user_id: learnerId,
          learning_item_id: itemId,
          content_version_id: versionOne,
          milestone_id: "m1",
          milestone_index: 0,
          status: "passed",
          evaluation_method: "automated_tests",
          code_snapshot_hash: hash,
          passed_at: new Date().toISOString()
        },
        {
          onConflict: "user_id,learning_item_id,content_version_id,milestone_id"
        }
      );
    expect((await write(firstHash)).error).toBeNull();
    expect((await write(secondHash)).error).toBeNull();
    const row = await learner
      .from("user_lab_milestone_progress")
      .select("code_snapshot_hash,milestone_index,evaluation_method")
      .eq("learning_item_id", itemId)
      .eq("content_version_id", versionOne)
      .single();
    expect(row.data).toMatchObject({
      code_snapshot_hash: secondHash,
      milestone_index: 0,
      evaluation_method: "automated_tests"
    });
  });

  it("rejects malformed hashes and keeps legacy NULL evidence non-authoritative", async () => {
    const malformed = await learner.from("user_lab_milestone_progress").insert({
      user_id: learnerId,
      learning_item_id: itemId,
      content_version_id: versionOne,
      milestone_id: "bad",
      status: "passed",
      code_snapshot_hash: "not-a-hash"
    });
    expect(malformed.error).not.toBeNull();
    const legacy = await learner.from("user_lab_milestone_progress").insert({
      user_id: learnerId,
      learning_item_id: itemId,
      content_version_id: versionOne,
      milestone_id: "legacy",
      status: "passed",
      code_snapshot_hash: null
    });
    expect(legacy.error).toBeNull();
    const authoritative = await learner
      .from("user_lab_milestone_progress")
      .select("milestone_id")
      .eq("learning_item_id", itemId)
      .eq("content_version_id", versionOne)
      .not("code_snapshot_hash", "is", null);
    expect(authoritative.data?.map((row) => row.milestone_id)).not.toContain("legacy");
  });

  it("keeps old-version milestone evidence separate", async () => {
    const hash = createHash("sha256").update("version two").digest("hex");
    const insert = await learner.from("user_lab_milestone_progress").insert({
      user_id: learnerId,
      learning_item_id: itemId,
      content_version_id: versionTwo,
      milestone_id: "m1",
      milestone_index: 0,
      status: "passed",
      evaluation_method: "automated_tests",
      code_snapshot_hash: hash
    });
    expect(insert.error).toBeNull();
    const current = await learner
      .from("user_lab_milestone_progress")
      .select("content_version_id")
      .eq("learning_item_id", itemId)
      .eq("content_version_id", versionTwo);
    expect(current.data).toHaveLength(1);
    expect(current.data?.[0]?.content_version_id).toBe(versionTwo);
  });

  it("serializes concurrent same-version completion and emits one event", async () => {
    const args = {
      p_project_id: itemId,
      p_content_version_id: versionOne,
      p_skill_id: knownSkillId,
      p_metadata: { test: "concurrent" }
    };
    const results = await Promise.all([
      learner.rpc("complete_user_lab_version", args),
      learner.rpc("complete_user_lab_version", args)
    ]);
    expect(results.every((result) => result.error === null)).toBe(true);
    expect(results.map((result) => result.data).sort()).toEqual(["already_completed", "completed"]);
    const events = await learner
      .from("skill_events")
      .select("id")
      .contains("metadata", { project_id: itemId, contentVersionId: versionOne });
    expect(events.data).toHaveLength(1);
  });

  it("allows a new version exactly once and ignores an unknown owner skill", async () => {
    const first = await learner.rpc("complete_user_lab_version", {
      p_project_id: itemId,
      p_content_version_id: versionTwo,
      p_skill_id: "unknown.owner.skill",
      p_metadata: { test: "new-version" }
    });
    const replay = await learner.rpc("complete_user_lab_version", {
      p_project_id: itemId,
      p_content_version_id: versionTwo,
      p_skill_id: "unknown.owner.skill",
      p_metadata: { test: "new-version" }
    });
    expect(first.data).toBe("completed");
    expect(replay.data).toBe("already_completed");
    const progress = await learner
      .from("project_lab_progress")
      .select("content_version_id,status")
      .eq("project_id", itemId)
      .single();
    expect(progress.data).toMatchObject({
      content_version_id: versionTwo,
      status: "completed"
    });
    const events = await learner
      .from("skill_events")
      .select("skill_id")
      .contains("metadata", { project_id: itemId, contentVersionId: versionTwo });
    expect(events.data).toEqual([{ skill_id: null }]);
  });

  it("keeps native/legacy project rows with a NULL version valid", async () => {
    const legacy = await learner.from("project_lab_progress").insert({
      user_id: learnerId,
      project_id: `legacy-${crypto.randomUUID()}`,
      content_version_id: null,
      status: "completed",
      completed_at: new Date().toISOString()
    });
    expect(legacy.error).toBeNull();
  });
});
