#!/usr/bin/env bash
#
# Verify that the live database has the durable Goal Evaluation schema and item
# pool needed by /goals/evaluation. This is intentionally psql-based because the
# start/submit RPCs require authenticated users and because missing functions are
# clearer to diagnose from pg_catalog than from the public REST API.
set -euo pipefail

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "SUPABASE_DB_URL is not set." >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "==> Installing postgresql-client"
  sudo apt-get update -y >/dev/null
  sudo apt-get install -y --no-install-recommends postgresql-client >/dev/null
fi

psql "${SUPABASE_DB_URL}" -v ON_ERROR_STOP=1 <<'SQL'
set search_path = public, pg_temp;

do $$
declare
  v_item_count integer;
begin
  if to_regclass('public.goal_evaluation_items') is null then
    raise exception 'missing table public.goal_evaluation_items';
  end if;
  if to_regclass('public.goal_evaluation_sessions') is null then
    raise exception 'missing table public.goal_evaluation_sessions';
  end if;
  if to_regclass('public.goal_evaluation_responses') is null then
    raise exception 'missing table public.goal_evaluation_responses';
  end if;
  if to_regclass('public.goal_evaluation_events') is null then
    raise exception 'missing table public.goal_evaluation_events';
  end if;

  if to_regprocedure('public.start_goal_evaluation(uuid,text,integer,text,integer)') is null then
    raise exception 'missing RPC public.start_goal_evaluation(uuid,text,integer,text,integer)';
  end if;
  if to_regprocedure('public.submit_goal_evaluation_answer(uuid,integer,uuid,text)') is null then
    raise exception 'missing RPC public.submit_goal_evaluation_answer(uuid,integer,uuid,text)';
  end if;
  if to_regprocedure('public.abandon_goal_evaluation(uuid)') is null then
    raise exception 'missing RPC public.abandon_goal_evaluation(uuid)';
  end if;

  select count(*) into v_item_count
  from public.goal_evaluation_items
  where goal_evaluation_eligible = true
    and retired_at is null
    and pool_version = 1;

  if v_item_count < 30 then
    raise exception 'goal evaluation pool has only % active items; expected at least 30', v_item_count;
  end if;
end $$;

select 'goal evaluation database verified' as status,
  count(*) as active_pool_items
from public.goal_evaluation_items
where goal_evaluation_eligible = true
  and retired_at is null
  and pool_version = 1;
SQL
