-- Allow practice sessions to persist their paused timer state (#177). RLS and
-- ownership are unchanged; this only expands the status check constraint.

alter table public.interview_sessions
  drop constraint if exists interview_sessions_status_check,
  add constraint interview_sessions_status_check
    check (status in ('in_progress', 'paused', 'completed', 'abandoned'));
