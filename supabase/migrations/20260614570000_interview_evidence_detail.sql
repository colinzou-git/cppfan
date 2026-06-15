-- Enrich interview practice evidence (#180) with the remaining evidence-model
-- fields: time to a viable approach and to a working implementation, the
-- follow-up result, and the problem version (so reworded problems do not silently
-- merge with their older form). Additive and idempotent; existing RLS row policies
-- and the per-user grant already cover these columns. Self-reported, separate from
-- FSRS. "Hidden-test result" is intentionally NOT here: it needs the code-execution
-- judge tracked under the parent interview track, and cppFan does not run learner
-- interview code in-process.

alter table public.interview_evidence
  add column if not exists time_to_approach_seconds integer
    check (time_to_approach_seconds is null or time_to_approach_seconds >= 0);

alter table public.interview_evidence
  add column if not exists time_to_implementation_seconds integer
    check (time_to_implementation_seconds is null or time_to_implementation_seconds >= 0);

alter table public.interview_evidence
  add column if not exists follow_up_result text not null default 'none'
    check (follow_up_result in ('none', 'passed', 'partial', 'failed'));

alter table public.interview_evidence
  add column if not exists problem_version integer not null default 1
    check (problem_version >= 1);
