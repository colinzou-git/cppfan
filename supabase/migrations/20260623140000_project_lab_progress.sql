-- #439 Project Labs: project-level completion + AI chat scoping.
--
-- 1. Allow the new 'project_lab' AI chat source kind so whole-project AI Chat /
--    Chat history are scoped to a project id (separate from milestone chats).
-- 2. Per-learner project completion. Best-effort and RLS-owned: /labs still
--    renders signed-out and pre-migration; this table only stores progress when
--    Supabase is configured and the learner is authenticated. A learner can
--    never read or write another learner's project progress.

-- 1. Extend the ai_chat_conversations.source_kind allowlist with 'project_lab'.
alter table public.ai_chat_conversations
  drop constraint if exists ai_chat_conversations_source_kind_check;
alter table public.ai_chat_conversations
  add constraint ai_chat_conversations_source_kind_check check (
    source_kind in (
      'learning_item',
      'quiz_question',
      'review_question',
      'guided_exercise',
      'write_code_exercise',
      'lab_item',
      'capstone_milestone',
      'project_lab',
      'interview_question',
      'timed_interview_question'
    )
  );

-- 2. Per-learner project completion.
create table if not exists public.project_lab_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, project_id)
);

alter table public.project_lab_progress enable row level security;

create index if not exists project_lab_progress_user_status_idx
  on public.project_lab_progress (user_id, status, updated_at desc);

drop policy if exists "project_lab_progress_select_own" on public.project_lab_progress;
drop policy if exists "project_lab_progress_insert_own" on public.project_lab_progress;
drop policy if exists "project_lab_progress_update_own" on public.project_lab_progress;
create policy "project_lab_progress_select_own" on public.project_lab_progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "project_lab_progress_insert_own" on public.project_lab_progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "project_lab_progress_update_own" on public.project_lab_progress
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.project_lab_progress to authenticated;

comment on table public.project_lab_progress is
  'Per-learner Project Labs (#439) completion; RLS restricts rows to the owning learner.';
