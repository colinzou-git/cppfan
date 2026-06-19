-- Durable dated goals, immutable revisions, targets, audit history, and daily
-- allocation snapshots (#265). FSRS, mastery, and acquisition remain separate.

create table if not exists public.study_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 2 and 120),
  status text not null default 'active' check (status in ('active', 'completed', 'expired', 'cancelled')),
  current_revision integer not null default 1 check (current_revision >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  cancelled_at timestamptz
);

create index if not exists study_goals_active_deadline_lookup_idx
  on public.study_goals (user_id, status, updated_at desc);

create table if not exists public.study_goal_revisions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.study_goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  revision_number integer not null check (revision_number >= 1),
  effective_at timestamptz not null default now(),
  start_local_date date not null,
  end_local_date date not null,
  timezone text not null,
  algorithm_version text not null,
  recommendation_source text not null check (
    recommendation_source in ('manual', 'history_recommendation', 'placement', 'evaluation')
  ),
  recommendation_reason text,
  learner_note text,
  created_at timestamptz not null default now(),
  check (end_local_date >= start_local_date),
  check ((end_local_date - start_local_date) between 0 and 29),
  unique (goal_id, revision_number)
);

create index if not exists study_goal_revisions_goal_history_idx
  on public.study_goal_revisions (user_id, goal_id, revision_number desc);

create table if not exists public.study_goal_targets (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.study_goals(id) on delete cascade,
  revision_id uuid not null references public.study_goal_revisions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  target_kind text not null check (target_kind in ('acquire_skill', 'complete_initial_application')),
  target_reference_id text not null,
  skill_id text references public.skills(id) on delete set null,
  catalog_target_id text,
  order_index integer not null check (order_index >= 0),
  weight double precision not null default 1 check (weight > 0),
  acquisition_contract_id text not null,
  acquisition_contract_version integer not null check (acquisition_contract_version >= 1),
  source text not null check (source in ('manual', 'history_recommendation', 'placement', 'evaluation')),
  baseline_acquisition_state text not null default 'not_started' check (
    baseline_acquisition_state in ('not_started', 'in_progress', 'initial_learning_complete', 'unavailable')
  ),
  baseline_evidence_at timestamptz,
  title_snapshot text not null,
  catalog_version text,
  created_at timestamptz not null default now(),
  check (
    (target_kind = 'acquire_skill' and skill_id is not null and catalog_target_id is null)
    or
    (target_kind = 'complete_initial_application' and skill_id is null and catalog_target_id is not null)
  ),
  unique (revision_id, target_kind, target_reference_id),
  unique (revision_id, order_index)
);

create index if not exists study_goal_targets_revision_idx
  on public.study_goal_targets (user_id, revision_id, order_index);
create index if not exists study_goal_targets_goal_idx
  on public.study_goal_targets (user_id, goal_id, target_kind, target_reference_id);

create table if not exists public.study_goal_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null references public.study_goals(id) on delete cascade,
  revision_id uuid references public.study_goal_revisions(id) on delete set null,
  event_type text not null check (event_type in ('created', 'revised', 'completed', 'expired', 'cancelled', 'reopened')),
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists study_goal_events_history_idx
  on public.study_goal_events (user_id, goal_id, created_at desc);

create table if not exists public.study_goal_mutation_receipts (
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_id uuid not null,
  mutation_kind text not null check (mutation_kind in ('create', 'revise', 'cancel', 'complete', 'reopen')),
  request_fingerprint text not null,
  goal_id uuid not null references public.study_goals(id) on delete cascade,
  revision_number integer not null check (revision_number >= 1),
  created_at timestamptz not null default now(),
  primary key (user_id, submission_id)
);

create table if not exists public.study_goal_daily_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_plan_date date not null,
  timezone text not null,
  daily_plan_version integer not null check (daily_plan_version >= 1),
  goal_id uuid not null references public.study_goals(id) on delete cascade,
  revision_id uuid not null references public.study_goal_revisions(id) on delete cascade,
  target_id uuid not null references public.study_goal_targets(id) on delete cascade,
  action_id text not null,
  acquisition_step_id text not null,
  source text not null check (source in ('planned', 'learn_extra')),
  destination_kind text not null,
  destination_id text not null,
  algorithm_version text not null,
  acquisition_contract_version integer not null check (acquisition_contract_version >= 1),
  allocated_at timestamptz not null default now(),
  status text not null default 'allocated' check (status in ('allocated', 'satisfied', 'dismissed', 'superseded', 'expired')),
  satisfied_evidence_key text,
  satisfied_at timestamptz,
  disposition_reason text,
  unique (user_id, local_plan_date, timezone, action_id, source)
);

create index if not exists study_goal_daily_allocations_day_idx
  on public.study_goal_daily_allocations (user_id, local_plan_date, timezone, daily_plan_version, allocated_at);

alter table public.study_goals enable row level security;
alter table public.study_goal_revisions enable row level security;
alter table public.study_goal_targets enable row level security;
alter table public.study_goal_events enable row level security;
alter table public.study_goal_mutation_receipts enable row level security;
alter table public.study_goal_daily_allocations enable row level security;

drop policy if exists "study_goals_select_own" on public.study_goals;
create policy "study_goals_select_own" on public.study_goals
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "study_goal_revisions_select_own" on public.study_goal_revisions;
create policy "study_goal_revisions_select_own" on public.study_goal_revisions
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "study_goal_targets_select_own" on public.study_goal_targets;
create policy "study_goal_targets_select_own" on public.study_goal_targets
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "study_goal_events_select_own" on public.study_goal_events;
create policy "study_goal_events_select_own" on public.study_goal_events
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "study_goal_mutation_receipts_select_own" on public.study_goal_mutation_receipts;
create policy "study_goal_mutation_receipts_select_own" on public.study_goal_mutation_receipts
for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "study_goal_daily_allocations_select_own" on public.study_goal_daily_allocations;
create policy "study_goal_daily_allocations_select_own" on public.study_goal_daily_allocations
for select to authenticated using ((select auth.uid()) = user_id);

revoke all on public.study_goals from anon, authenticated;
revoke all on public.study_goal_revisions from anon, authenticated;
revoke all on public.study_goal_targets from anon, authenticated;
revoke all on public.study_goal_events from anon, authenticated;
revoke all on public.study_goal_mutation_receipts from anon, authenticated;
revoke all on public.study_goal_daily_allocations from anon, authenticated;

grant select on public.study_goals to authenticated;
grant select on public.study_goal_revisions to authenticated;
grant select on public.study_goal_targets to authenticated;
grant select on public.study_goal_events to authenticated;
grant select on public.study_goal_mutation_receipts to authenticated;
grant select on public.study_goal_daily_allocations to authenticated;
