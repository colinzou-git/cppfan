-- cppFan skill event ledger: append-only evidence used by skill mastery
-- scoring. Mastery is a separate concern from FSRS review scheduling (see
-- docs/SKILL_ENGINE.md): this ledger feeds rule-based mastery, not card state.
--
-- Event names are the stable names in docs/EVENT_SCHEMA_STABLE_NAMES.md.
-- This migration does NOT add an ML model, recommendations, or code execution.

create table if not exists public.skill_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id text references public.skills(id) on delete cascade,
  learning_item_id text references public.learning_items(id) on delete set null,
  review_card_id uuid references public.review_cards(id) on delete set null,
  event_type text not null check (event_type in (
    'lesson_started',
    'concept_seen',
    'quiz_attempted',
    'quiz_correct',
    'quiz_wrong',
    'hint_used',
    'review_completed',
    'code_attempted',
    'code_passed',
    'skill_mastered',
    'skill_regressed'
  )),
  event_time timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.skill_events enable row level security;

create index if not exists skill_events_user_skill_time_idx
  on public.skill_events (user_id, skill_id, event_time desc);

-- Per-user, append-only evidence: a learner can read and insert their own
-- events but never update or delete them.
drop policy if exists "skill_events_select_own" on public.skill_events;
drop policy if exists "skill_events_insert_own" on public.skill_events;

create policy "skill_events_select_own"
on public.skill_events
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "skill_events_insert_own"
on public.skill_events
for insert
to authenticated
with check ((select auth.uid()) = user_id);
