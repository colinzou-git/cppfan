-- cppFan FSRS review scheduling: spaced-review cards and an append-only review
-- log. This is review scheduling only and is deliberately separate from skill
-- mastery (see docs/SKILL_ENGINE.md). It does not add mastery scoring,
-- recommendations, or code execution.

create table if not exists public.review_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  learning_item_id text not null references public.learning_items(id) on delete cascade,
  skill_id text not null references public.skills(id) on delete cascade,
  state text not null default 'new'
    check (state in ('new', 'learning', 'review', 'relearning')),
  due_at timestamptz not null default now(),
  stability double precision not null default 0,
  difficulty double precision not null default 0,
  elapsed_days integer not null default 0,
  scheduled_days integer not null default 0,
  learning_steps integer not null default 0,
  reps integer not null default 0,
  lapses integer not null default 0,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, learning_item_id)
);

create table if not exists public.review_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  review_card_id uuid not null references public.review_cards(id) on delete cascade,
  rating text not null check (rating in ('again', 'hard', 'good', 'easy')),
  state text not null,
  due_at timestamptz not null,
  stability double precision not null,
  difficulty double precision not null,
  elapsed_days integer not null,
  last_elapsed_days integer not null,
  scheduled_days integer not null,
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.review_cards enable row level security;
alter table public.review_logs enable row level security;

create index if not exists review_cards_user_due_idx
  on public.review_cards (user_id, due_at);

create index if not exists review_logs_card_idx
  on public.review_logs (review_card_id, reviewed_at desc);

drop trigger if exists set_review_cards_updated_at on public.review_cards;

create trigger set_review_cards_updated_at
before update on public.review_cards
for each row
execute function public.set_updated_at();

-- Per-user data. A learner manages only their own cards; logs are append-only
-- evidence the learner can read and insert but not change.
drop policy if exists "review_cards_select_own" on public.review_cards;
drop policy if exists "review_cards_insert_own" on public.review_cards;
drop policy if exists "review_cards_update_own" on public.review_cards;
drop policy if exists "review_logs_select_own" on public.review_logs;
drop policy if exists "review_logs_insert_own" on public.review_logs;

create policy "review_cards_select_own"
on public.review_cards
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "review_cards_insert_own"
on public.review_cards
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "review_cards_update_own"
on public.review_cards
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "review_logs_select_own"
on public.review_logs
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "review_logs_insert_own"
on public.review_logs
for insert
to authenticated
with check ((select auth.uid()) = user_id);
