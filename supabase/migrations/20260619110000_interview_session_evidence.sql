-- Extend the current per-learner interview session row with self-reported
-- evidence needed by #177: per-phase timing, phase notes, draft code/test notes,
-- interviewer assistance use, and abandonment reason. RLS remains unchanged:
-- learners can only read and write their own current session row.

alter table public.interview_sessions
  add column if not exists phase_elapsed_seconds jsonb not null default '{}'::jsonb,
  add column if not exists notes_by_phase jsonb not null default '{}'::jsonb,
  add column if not exists code_draft text not null default '',
  add column if not exists test_notes text not null default '',
  add column if not exists assistance_used boolean not null default false,
  add column if not exists abandonment_reason text;

alter table public.interview_sessions
  drop constraint if exists interview_sessions_phase_elapsed_seconds_is_object,
  add constraint interview_sessions_phase_elapsed_seconds_is_object
    check (jsonb_typeof(phase_elapsed_seconds) = 'object'),
  drop constraint if exists interview_sessions_notes_by_phase_is_object,
  add constraint interview_sessions_notes_by_phase_is_object
    check (jsonb_typeof(notes_by_phase) = 'object');
