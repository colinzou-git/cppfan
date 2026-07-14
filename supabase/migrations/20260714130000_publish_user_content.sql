-- #487 Phase 1: publish user content + make the lifecycle RPCs projection-aware.
--
-- publish_user_content freezes the active draft into an immutable published
-- version and projects it into ONE owner-scoped public.skills row and ONE
-- public.learning_items row (plus the primary learning_item_skills mapping), so
-- the existing learning loop can consume user content through its normal text
-- foreign keys. archive/restore/delete are updated to keep that projection in
-- sync (deactivate on archive, reactivate on restore, and remove projected rows
-- before deleting versions so the content_version_id RESTRICT FK never blocks a
-- delete). Interactive child projections (choices/parsons/completion) follow in
-- a later slice; a published lesson is immediately learnable (Mark learned /
-- whole-lesson review) via the core projection here.

create or replace function public.publish_user_content(
  p_content_id uuid,
  p_expected_revision bigint
)
returns table (out_content_id uuid, out_skill_id text, out_learning_item_id text, out_version_number integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_item public.user_content_items%rowtype;
  v_version public.user_content_versions%rowtype;
  v_payload jsonb;
  v_skill_id text;
  v_item_id text;
  v_module text;
  v_domain text;
  v_item_type text;
  v_title text;
  v_difficulty text;
  v_est integer;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  select * into v_item from public.user_content_items where id = p_content_id for update;
  if not found or v_item.user_id <> v_user then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if v_item.kind <> 'lesson' then
    raise exception 'only lessons can be published in phase 1' using errcode = '22023';
  end if;
  if p_expected_revision is not null and v_item.draft_revision is distinct from p_expected_revision then
    raise exception 'stale revision' using errcode = '40001';
  end if;
  if v_item.current_draft_version_id is null then
    raise exception 'nothing to publish' using errcode = '22023';
  end if;

  select * into v_version from public.user_content_versions
    where id = v_item.current_draft_version_id for update;
  if not found or v_version.version_state <> 'draft' then
    raise exception 'draft version missing' using errcode = '22023';
  end if;
  v_payload := v_version.payload;

  v_item_type := coalesce(v_payload->>'itemType', 'lesson');
  v_title := coalesce(nullif(btrim(coalesce(v_payload->>'title', v_item.title)), ''), v_item.title);
  v_difficulty := coalesce(v_payload->>'difficulty', 'beginner');
  if v_difficulty not in ('beginner', 'intermediate', 'advanced') then
    v_difficulty := 'beginner';
  end if;
  v_est := coalesce((v_payload->>'estimatedMinutes')::integer, 5);
  if v_est < 1 or v_est > 120 then
    v_est := 5;
  end if;
  v_module := coalesce(v_item.native_module_id, 'cpp.user_content');
  v_domain := case when v_module like 'dsa%' then 'dsa' else 'cpp' end;
  v_skill_id := 'user.skill.' || p_content_id::text;
  v_item_id := 'user.item.' || p_content_id::text;

  -- Freeze this draft as the published version; supersede the prior published one.
  update public.user_content_versions set version_state = 'superseded', updated_at = now()
    where content_item_id = p_content_id and version_state = 'published';
  update public.user_content_versions
    set version_state = 'published', published_at = now(), updated_at = now()
    where id = v_version.id;

  -- Owner-scoped skill projection.
  insert into public.skills (
    id, domain, module_id, title, description, learner_goal, level, item_types, order_index,
    is_active, owner_user_id, content_item_id, content_version_id, source_kind
  ) values (
    v_skill_id, v_domain, v_module, v_title,
    coalesce(nullif(v_payload->>'explanation', ''), v_title), v_title, v_difficulty,
    array[v_item_type], 0, true, v_user, p_content_id, v_version.id, 'user'
  )
  on conflict (id) do update set
    domain = excluded.domain, module_id = excluded.module_id, title = excluded.title,
    description = excluded.description, learner_goal = excluded.learner_goal, level = excluded.level,
    item_types = excluded.item_types, is_active = true, content_version_id = excluded.content_version_id,
    updated_at = now();

  -- Owner-scoped primary learning-item projection.
  insert into public.learning_items (
    id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index,
    is_active, owner_user_id, content_item_id, content_version_id, source_kind
  ) values (
    v_item_id, v_item_type, v_title, coalesce(nullif(v_payload->>'content', ''), v_title),
    v_payload->>'explanation', v_difficulty, v_est, 0, true, v_user, p_content_id, v_version.id, 'user'
  )
  on conflict (id) do update set
    type = excluded.type, title = excluded.title, prompt = excluded.prompt,
    explanation = excluded.explanation, difficulty = excluded.difficulty,
    estimated_minutes = excluded.estimated_minutes, is_active = true,
    content_version_id = excluded.content_version_id, updated_at = now();

  insert into public.learning_item_skills (learning_item_id, skill_id, is_primary)
  values (v_item_id, v_skill_id, true)
  on conflict (learning_item_id, skill_id) do update set is_primary = true;

  update public.user_content_items
    set lifecycle_status = 'published', current_published_version_id = v_version.id,
        current_draft_version_id = null, published_at = now(), updated_at = now()
    where id = p_content_id;

  return query select p_content_id, v_skill_id, v_item_id, v_version.version_number;
end;
$$;

-- Archive now also deactivates the projected rows (kept, just hidden).
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
  update public.skills set is_active = false, updated_at = now() where content_item_id = p_content_id;
  update public.learning_items set is_active = false, updated_at = now() where content_item_id = p_content_id;
  return query select p_content_id, 'archived'::text;
end;
$$;

-- Restore reactivates the projected rows when a published version exists.
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
  if v_status = 'published' then
    update public.skills set is_active = true, updated_at = now() where content_item_id = p_content_id;
    update public.learning_items set is_active = true, updated_at = now() where content_item_id = p_content_id;
  end if;
  return query select p_content_id, v_status;
end;
$$;

-- Delete is projection-aware. Projected rows reference user_content_versions via
-- content_version_id ON DELETE RESTRICT, so they must be removed BEFORE the
-- versions are cascade-deleted with the item.
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
    update public.skills set is_active = false, updated_at = now() where content_item_id = p_content_id;
    update public.learning_items set is_active = false, updated_at = now() where content_item_id = p_content_id;
    return query select p_content_id, p_mode, false;
    return;
  end if;

  if p_mode = 'delete_editable' then
    delete from public.user_content_attachments where content_item_id = p_content_id;
    delete from public.user_content_versions
      where content_item_id = p_content_id and version_state = 'draft';
    update public.user_content_items
      set current_draft_version_id = null, lifecycle_status = 'archived',
          archived_at = now(), updated_at = now()
      where id = p_content_id;
    update public.skills set is_active = false, updated_at = now() where content_item_id = p_content_id;
    update public.learning_items set is_active = false, updated_at = now() where content_item_id = p_content_id;
    return query select p_content_id, p_mode, false;
    return;
  end if;

  -- delete_all: remove projected rows first (they RESTRICT version deletes),
  -- clear the item's version pointers, then delete the item (cascades versions,
  -- attachments, and the projected rows' content_item FK).
  delete from public.learning_items where content_item_id = p_content_id;
  delete from public.skills where content_item_id = p_content_id;
  update public.user_content_items
    set current_draft_version_id = null, current_published_version_id = null
    where id = p_content_id;
  delete from public.user_content_items where id = p_content_id;
  return query select p_content_id, p_mode, true;
end;
$$;

revoke all on function public.publish_user_content(uuid, bigint) from public;
grant execute on function public.publish_user_content(uuid, bigint) to authenticated;
