create table if not exists public.goal_evaluation_items (
  learning_item_id text primary key references public.learning_items(id) on delete cascade,
  primary_skill_id text not null references public.skills(id) on delete cascade,
  module_id text not null references public.placement_modules(module_id) on delete cascade,
  difficulty_band integer not null check (difficulty_band between 1 and 5),
  diagnostic_weight integer not null check (diagnostic_weight between 1 and 3),
  prerequisite_level integer not null check (prerequisite_level between 1 and 5),
  item_type text not null,
  estimated_minutes integer not null check (estimated_minutes > 0),
  placement_eligible boolean not null default true,
  goal_evaluation_eligible boolean not null default true,
  pool_version integer not null default 1 check (pool_version > 0),
  retired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goal_evaluation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_id uuid not null,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  current_item_id text references public.goal_evaluation_items(learning_item_id),
  question_index integer not null default 1 check (question_index between 1 and 30),
  answer_count integer not null default 0 check (answer_count between 0 and 30),
  algorithm_version text not null,
  item_pool_version integer not null check (item_pool_version > 0),
  model_state jsonb not null default '{}'::jsonb,
  findings jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  abandoned_at timestamptz,
  unique (user_id, submission_id)
);

create unique index if not exists goal_evaluation_one_active_session_idx
  on public.goal_evaluation_sessions (user_id)
  where status = 'active';

create table if not exists public.goal_evaluation_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.goal_evaluation_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  sequence_no integer not null check (sequence_no between 1 and 30),
  learning_item_id text not null references public.goal_evaluation_items(learning_item_id),
  choice_id text not null,
  is_correct boolean not null,
  module_id text not null,
  primary_skill_id text not null,
  difficulty_band integer not null check (difficulty_band between 1 and 5),
  diagnostic_weight integer not null check (diagnostic_weight between 1 and 3),
  item_type text not null,
  responded_at timestamptz not null default now(),
  unique (session_id, sequence_no),
  unique (session_id, learning_item_id)
);

create index if not exists goal_evaluation_sessions_user_updated_idx
  on public.goal_evaluation_sessions (user_id, updated_at desc);
create index if not exists goal_evaluation_responses_session_sequence_idx
  on public.goal_evaluation_responses (session_id, sequence_no);
create index if not exists goal_evaluation_items_module_idx
  on public.goal_evaluation_items (module_id, difficulty_band, learning_item_id)
  where goal_evaluation_eligible = true and retired_at is null;

alter table public.goal_evaluation_items enable row level security;
alter table public.goal_evaluation_sessions enable row level security;
alter table public.goal_evaluation_responses enable row level security;

-- Public diagnostic metadata is answer-key free. Choices remain protected by the
-- existing learning-item policies; correctness is read only inside trusted RPCs.
drop policy if exists "goal_evaluation_items_read_all" on public.goal_evaluation_items;
create policy "goal_evaluation_items_read_all"
on public.goal_evaluation_items for select to anon, authenticated
using (goal_evaluation_eligible = true and retired_at is null);

drop policy if exists "goal_evaluation_sessions_read_own" on public.goal_evaluation_sessions;
create policy "goal_evaluation_sessions_read_own"
on public.goal_evaluation_sessions for select to authenticated
using (user_id = auth.uid());

drop policy if exists "goal_evaluation_responses_read_own" on public.goal_evaluation_responses;
create policy "goal_evaluation_responses_read_own"
on public.goal_evaluation_responses for select to authenticated
using (user_id = auth.uid());

-- No direct learner write policies. All mutations go through security-definer RPCs.

drop trigger if exists set_goal_evaluation_items_updated_at on public.goal_evaluation_items;
create trigger set_goal_evaluation_items_updated_at
before update on public.goal_evaluation_items
for each row execute function public.set_updated_at();

drop trigger if exists set_goal_evaluation_sessions_updated_at on public.goal_evaluation_sessions;
create trigger set_goal_evaluation_sessions_updated_at
before update on public.goal_evaluation_sessions
for each row execute function public.set_updated_at();
