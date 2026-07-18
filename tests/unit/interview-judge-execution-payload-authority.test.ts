import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Static authority checks for the #608 dynamic-judge migration. The disposable
// Supabase integration suite proves the runtime behavior; this guards the
// migration text so the private worker-payload boundary cannot silently regress.
const migration = readFileSync(
  "supabase/migrations/20260718090000_interview_judge_execution_payloads.sql",
  "utf8"
);

describe("interview judge execution payload migration (#608)", () => {
  it("adds version identity + definition source to the learner-readable submissions row", () => {
    expect(migration).toMatch(/add column if not exists definition_source text[\s\S]+check \(definition_source in \('native', 'user'\)\)/i);
    expect(migration).toMatch(/add column if not exists content_version_id uuid/i);
  });

  it("stores raw source + fixtures in a SEPARATE table with no learner access", () => {
    expect(migration).toMatch(/create table if not exists public\.interview_judge_execution_payloads/i);
    expect(migration).toMatch(/source_text text not null/i);
    expect(migration).toMatch(/worker_tests jsonb not null/i);
    expect(migration).toMatch(/fixtures jsonb not null/i);
    expect(migration).toMatch(/alter table public\.interview_judge_execution_payloads enable row level security/i);
    // Revoked from both roles and NO select/insert/update/delete policy is created.
    expect(migration).toMatch(/revoke all on public\.interview_judge_execution_payloads from anon, authenticated/i);
    expect(migration).not.toMatch(/create policy[\s\S]+on public\.interview_judge_execution_payloads/i);
    // The queue/submissions ALTER must never add source text or fixtures.
    const submissionsAlter = migration.slice(
      migration.indexOf("alter table public.interview_judge_submissions"),
      migration.indexOf("create table if not exists public.interview_judge_execution_payloads")
    );
    expect(submissionsAlter).not.toMatch(/source_text|fixtures/i);
  });

  it("enqueues the submission row and private payload atomically via one RPC", () => {
    expect(migration).toMatch(/enqueue_interview_judge_submission\(\s*p_submission jsonb,\s*p_execution jsonb default null\s*\)/);
    expect(migration).toMatch(/security definer/);
    expect(migration).toMatch(/insert into public\.interview_judge_submissions[\s\S]+definition_source[\s\S]+content_version_id/i);
    expect(migration).toMatch(/insert into public\.interview_judge_execution_payloads/i);
    expect(migration).toMatch(/if p_execution is not null then/i);
    expect(migration).toMatch(/grant execute on function public\.enqueue_interview_judge_submission\(jsonb, jsonb\) to authenticated/i);
  });
});
