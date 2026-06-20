-- Caller-bound helpers over the RLS-protected append-only usage table.

create or replace function public.consume_ai_chat_quota(
  p_input_chars integer,
  p_max_requests integer default 50,
  p_max_input_chars bigint default 250000
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_request_count bigint;
  v_input_chars bigint;
  v_input integer := greatest(coalesce(p_input_chars, 0), 0);
begin
  if v_user_id is null then
    return jsonb_build_object('allowed', false, 'request_count', 0, 'input_chars', 0);
  end if;

  select
    count(*) filter (where event_kind = 'request'),
    coalesce(sum(input_chars), 0)
  into v_request_count, v_input_chars
  from public.ai_chat_usage_events
  where user_id = v_user_id
    and created_at >= date_trunc('day', now() at time zone 'utc');

  if v_request_count >= least(greatest(coalesce(p_max_requests, 1), 1), 500)
    or v_input_chars + v_input > least(greatest(coalesce(p_max_input_chars, 1), 1), 5000000)
  then
    return jsonb_build_object('allowed', false, 'request_count', v_request_count, 'input_chars', v_input_chars);
  end if;

  insert into public.ai_chat_usage_events (user_id, event_kind, input_chars)
  values (v_user_id, 'request', v_input);

  return jsonb_build_object('allowed', true, 'request_count', v_request_count + 1, 'input_chars', v_input_chars + v_input);
end;
$$;

create or replace function public.record_ai_chat_output(p_output_chars integer)
returns void
language plpgsql
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is not null then
    insert into public.ai_chat_usage_events (user_id, event_kind, output_chars)
    values (v_user_id, 'output', greatest(coalesce(p_output_chars, 0), 0));
  end if;
end;
$$;
