-- cppFan quiz attempts: records a learner's answer to a choice-based learning
-- item and whether it was correct.
--
-- This is per-user data, protected by RLS so a learner can only read and insert
-- their own attempts. Retrying an item creates a new attempt row; attempts are
-- never updated or deleted by learners.
--
-- This migration intentionally does NOT add FSRS review cards, mastery scoring,
-- recommendations, or code execution.

create table if not exists public.learning_item_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  learning_item_id text not null references public.learning_items(id) on delete cascade,
  selected_choice_id text references public.learning_item_choices(id) on delete set null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

alter table public.learning_item_attempts enable row level security;

create index if not exists learning_item_attempts_user_item_idx
  on public.learning_item_attempts (user_id, learning_item_id, created_at desc);

-- Per-user isolation: a learner can only see and create their own attempts.
-- No update/delete policies: attempts are immutable once recorded.
drop policy if exists "attempts_select_own" on public.learning_item_attempts;
drop policy if exists "attempts_insert_own" on public.learning_item_attempts;

create policy "attempts_select_own"
on public.learning_item_attempts
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "attempts_insert_own"
on public.learning_item_attempts
for insert
to authenticated
with check ((select auth.uid()) = user_id);
