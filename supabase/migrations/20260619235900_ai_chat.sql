-- Authenticated, per-item AI Chat history (#375, #382, #386).
-- Chat records are advisory and intentionally separate from learning evidence.

create table if not exists public.ai_chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_kind text not null check (
    source_kind in (
      'learning_item',
      'quiz_question',
      'review_question',
      'guided_exercise',
      'write_code_exercise',
      'lab_item',
      'capstone_milestone',
      'interview_question',
      'timed_interview_question'
    )
  ),
  source_id text not null check (char_length(source_id) between 1 and 240),
  source_version text not null check (char_length(source_version) between 1 and 120),
  title text not null check (char_length(title) between 1 and 300),
  provider text,
  model text,
  context_fingerprint text not null check (char_length(context_fingerprint) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create index if not exists ai_chat_conversations_item_idx
  on public.ai_chat_conversations (user_id, source_kind, source_id, updated_at desc);

create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  sequence bigint generated always as identity,
  role text not null check (role in ('user', 'assistant')),
  content text not null default '' check (char_length(content) <= 50000),
  status text not null check (status in ('streaming', 'complete', 'stopped', 'failed')),
  provider text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (conversation_id, user_id)
    references public.ai_chat_conversations(id, user_id)
    on delete cascade,
  unique (conversation_id, role, request_id)
);

create index if not exists ai_chat_messages_conversation_idx
  on public.ai_chat_messages (conversation_id, sequence);

create table if not exists public.ai_chat_usage_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_kind text not null check (event_kind in ('request', 'output')),
  input_chars integer not null default 0 check (input_chars >= 0),
  output_chars integer not null default 0 check (output_chars >= 0),
  created_at timestamptz not null default now()
);

create index if not exists ai_chat_usage_events_user_time_idx
  on public.ai_chat_usage_events (user_id, created_at desc);

alter table public.ai_chat_conversations enable row level security;
alter table public.ai_chat_messages enable row level security;
alter table public.ai_chat_usage_events enable row level security;

drop policy if exists "ai_chat_conversations_select_own" on public.ai_chat_conversations;
drop policy if exists "ai_chat_conversations_insert_own" on public.ai_chat_conversations;
drop policy if exists "ai_chat_conversations_update_own" on public.ai_chat_conversations;
drop policy if exists "ai_chat_conversations_delete_own" on public.ai_chat_conversations;
create policy "ai_chat_conversations_select_own" on public.ai_chat_conversations for select to authenticated using ((select auth.uid()) = user_id);
create policy "ai_chat_conversations_insert_own" on public.ai_chat_conversations for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "ai_chat_conversations_update_own" on public.ai_chat_conversations for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "ai_chat_conversations_delete_own" on public.ai_chat_conversations for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "ai_chat_messages_select_own" on public.ai_chat_messages;
drop policy if exists "ai_chat_messages_insert_own" on public.ai_chat_messages;
drop policy if exists "ai_chat_messages_update_own" on public.ai_chat_messages;
drop policy if exists "ai_chat_messages_delete_own" on public.ai_chat_messages;
create policy "ai_chat_messages_select_own" on public.ai_chat_messages for select to authenticated using ((select auth.uid()) = user_id);
create policy "ai_chat_messages_insert_own" on public.ai_chat_messages for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "ai_chat_messages_update_own" on public.ai_chat_messages for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "ai_chat_messages_delete_own" on public.ai_chat_messages for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "ai_chat_usage_events_select_own" on public.ai_chat_usage_events;
drop policy if exists "ai_chat_usage_events_insert_own" on public.ai_chat_usage_events;
create policy "ai_chat_usage_events_select_own" on public.ai_chat_usage_events for select to authenticated using ((select auth.uid()) = user_id);
create policy "ai_chat_usage_events_insert_own" on public.ai_chat_usage_events for insert to authenticated with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.ai_chat_conversations to authenticated;
grant select, insert, update, delete on public.ai_chat_messages to authenticated;
grant select, insert on public.ai_chat_usage_events to authenticated;
grant usage, select on sequence public.ai_chat_messages_sequence_seq to authenticated;
grant usage, select on sequence public.ai_chat_usage_events_id_seq to authenticated;
