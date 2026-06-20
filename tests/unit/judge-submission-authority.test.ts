import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/20260620101500_harden_interview_judge_submissions.sql", "utf8");

describe("server-authoritative judge submission migration (#178)", () => {
  it("keeps result mutations worker-only and exposes only the bounded enqueue RPC", () => {
    expect(migration).toMatch(/revoke insert, update, delete[\s\S]+from anon, authenticated/i);
    expect(migration).not.toMatch(/grant select, insert, update, delete[\s\S]+to authenticated/i);
    expect(migration).toMatch(/enqueue_interview_judge_submission\(p_submission jsonb\)/);
    expect(migration).toMatch(/security definer/);
    expect(migration).toMatch(/v_user uuid := auth\.uid\(\)/);
    expect(migration).toMatch(/interview_sessions where id = v_session_id and user_id = v_user/);
  });

  it("serializes and enforces idempotency, queue bounds, and minute-rate bounds", () => {
    expect(migration).toMatch(/pg_advisory_xact_lock/);
    expect(migration).toMatch(/status in \('queued', 'running'\)/);
    expect(migration).toMatch(/interval '1 minute'/);
    expect(migration).toMatch(/visible_total[\s\S]+hidden_total[\s\S]+> 200/);
    expect(migration).toMatch(/return 'duplicate'/);
    expect(migration).toMatch(/return 'queued'/);
  });
});
