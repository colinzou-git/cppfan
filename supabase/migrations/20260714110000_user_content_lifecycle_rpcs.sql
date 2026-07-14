-- #487 Phase 1: trusted draft-lifecycle RPCs for user-created content.
--
-- These SECURITY DEFINER functions are the server-authoritative write path for
-- the canonical user_content_* tables. Each stamps user_id from auth.uid(),
-- validates ownership, and (for saves) enforces optimistic concurrency through
-- draft_revision so two devices editing the same draft cannot silently clobber
-- one another. Publishing (which projects into skills/learning_items) and its
-- history handling land in a later slice once the projection columns exist; this
-- slice covers create/save/archive/restore/delete on the canonical tables only.
--
-- Direct client writes remain governed by the per-owner RLS from the table
-- migration; these RPCs add the trusted, concurrency-safe path the editor uses.

-- Save (create or update) the active draft. Returns the item id, the draft
-- version id, the new revision, and the server timestamp.
create or replace function public.save_user_content_draft(
  p_content_id uuid,
  p_kind text,
  p_title text,
  p_native_module_id text,
  p_recommendation_enabled boolean,
  p_schema_version integer,
  p_payload jsonb,
  p_expected_revision bigint
)
returns table (content_id uuid, draft_version_id uuid, revision bigint, saved_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_item public.user_content_items%rowtype;
  v_draft uuid;
  v_new_rev bigint;
  v_next_number integer;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if p_kind is null or p_kind not in ('lesson', 'exercise', 'lab', 'interview_problem') then
    raise exception 'invalid content kind' using errcode = '22023';
  end if;
  if p_title is null or length(btrim(p_title)) = 0 then
    raise exception 'title is required' using errcode = '22023';
  end if;

  -- New item: create the item and its first draft version.
  if p_content_id is null then
    insert into public.user_content_items (
      user_id, kind, title, native_module_id, recommendation_enabled, draft_revision
    ) values (
      v_user, p_kind, btrim(p_title), p_native_module_id, coalesce(p_recommendation_enabled, true), 1
    ) returning * into v_item;

    insert into public.user_content_versions (
      content_item_id, user_id, version_number, schema_version, version_state, payload
    ) values (
      v_item.id, v_user, 1, coalesce(p_schema_version, 1), 'draft', p_payload
    ) returning id into v_draft;

    update public.user_content_items
      set current_draft_version_id = v_draft, updated_at = now()
      where id = v_item.id;

    return query select v_item.id, v_draft, 1::bigint, now();
    return;
  end if;

  -- Existing item: lock, check ownership, check optimistic concurrency.
  select * into v_item from public.user_content_items where id = p_content_id for update;
  if not found then
    raise exception 'content item not found' using errcode = 'P0002';
  end if;
  if v_item.user_id <> v_user then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_expected_revision is not null and v_item.draft_revision is distinct from p_expected_revision then
    raise exception 'stale revision: expected %, found %', p_expected_revision, v_item.draft_revision
      using errcode = '40001';
  end if;

  -- Update the current draft version in place if it is still a draft; otherwise
  -- (e.g. editing a published item) start a new draft version.
  if v_item.current_draft_version_id is not null then
    update public.user_content_versions
      set payload = p_payload,
          schema_version = coalesce(p_schema_version, schema_version),
          updated_at = now()
      where id = v_item.current_draft_version_id and version_state = 'draft'
      returning id into v_draft;
  end if;

  if v_draft is null then
    select coalesce(max(version_number), 0) + 1 into v_next_number
      from public.user_content_versions where content_item_id = p_content_id;
    insert into public.user_content_versions (
      content_item_id, user_id, version_number, schema_version, version_state, payload
    ) values (
      p_content_id, v_user, v_next_number, coalesce(p_schema_version, 1), 'draft', p_payload
    ) returning id into v_draft;
  end if;

  v_new_rev := v_item.draft_revision + 1;
  update public.user_content_items
    set title = btrim(p_title),
        native_module_id = p_native_module_id,
        recommendation_enabled = coalesce(p_recommendation_enabled, recommendation_enabled),
        current_draft_version_id = v_draft,
        draft_revision = v_new_rev,
        updated_at = now()
    where id = p_content_id;

  return query select p_content_id, v_draft, v_new_rev, now();
end;
$$;

-- Archive an item (owner only).
create or replace function public.archive_user_content(p_content_id uuid)
returns table (content_id uuid, lifecycle_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_item public.user_content_items%rowtype;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  select * into v_item from public.user_content_items where id = p_content_id for update;
  if not found or v_item.user_id <> v_user then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  update public.user_content_items
    set lifecycle_status = 'archived', archived_at = now(), updated_at = now()
    where id = p_content_id;
  return query select p_content_id, 'archived'::text;
end;
$$;

-- Restore an archived item back to published (if it has a published version) or draft.
create or replace function public.restore_user_content(p_content_id uuid)
returns table (content_id uuid, lifecycle_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_item public.user_content_items%rowtype;
  v_status text;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  select * into v_item from public.user_content_items where id = p_content_id for update;
  if not found or v_item.user_id <> v_user then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  v_status := case when v_item.current_published_version_id is not null then 'published' else 'draft' end;
  update public.user_content_items
    set lifecycle_status = v_status, archived_at = null, updated_at = now()
    where id = p_content_id;
  return query select p_content_id, v_status;
end;
$$;

-- Delete with an explicit mode so history is never silently destroyed:
--   'archive'         -> soft archive (same as archive_user_content)
--   'delete_editable' -> drop draft versions + attachments, keep published/superseded history
--   'delete_all'      -> remove the item and everything it owns (cascades)
create or replace function public.delete_user_content(p_content_id uuid, p_mode text)
returns table (content_id uuid, mode text, deleted boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_item public.user_content_items%rowtype;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if p_mode is null or p_mode not in ('archive', 'delete_editable', 'delete_all') then
    raise exception 'invalid delete mode' using errcode = '22023';
  end if;
  select * into v_item from public.user_content_items where id = p_content_id for update;
  if not found or v_item.user_id <> v_user then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if p_mode = 'archive' then
    update public.user_content_items
      set lifecycle_status = 'archived', archived_at = now(), updated_at = now()
      where id = p_content_id;
    return query select p_content_id, p_mode, false;
    return;
  end if;

  if p_mode = 'delete_editable' then
    delete from public.user_content_attachments where content_item_id = p_content_id;
    delete from public.user_content_versions
      where content_item_id = p_content_id and version_state = 'draft';
    update public.user_content_items
      set current_draft_version_id = null,
          lifecycle_status = 'archived',
          archived_at = now(),
          updated_at = now()
      where id = p_content_id;
    return query select p_content_id, p_mode, false;
    return;
  end if;

  -- delete_all: clear the item's version pointers first so the FKs don't block,
  -- then delete the item (versions/attachments cascade).
  update public.user_content_items
    set current_draft_version_id = null, current_published_version_id = null
    where id = p_content_id;
  delete from public.user_content_items where id = p_content_id;
  return query select p_content_id, p_mode, true;
end;
$$;

revoke all on function public.save_user_content_draft(uuid, text, text, text, boolean, integer, jsonb, bigint) from public;
grant execute on function public.save_user_content_draft(uuid, text, text, text, boolean, integer, jsonb, bigint) to authenticated;
revoke all on function public.archive_user_content(uuid) from public;
grant execute on function public.archive_user_content(uuid) to authenticated;
revoke all on function public.restore_user_content(uuid) from public;
grant execute on function public.restore_user_content(uuid) to authenticated;
revoke all on function public.delete_user_content(uuid, text) from public;
grant execute on function public.delete_user_content(uuid, text) to authenticated;
