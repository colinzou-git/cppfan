-- #487 Phase 1: project multiple-choice options when publishing user content.
--
-- Extends publish_user_content so a published multiple_choice lesson is gradeable
-- through the existing native path: the payload's choices are projected into
-- public.learning_item_choices (id, content, is_correct, order_index), keyed off
-- the projected learning item id. is_correct stays server-side (the public choice
-- read never selects it), so the answer key is not leaked to the client. Choices
-- are replaced on every publish (and cleared when the item is not multiple choice)
-- so re-publishing never leaves stale options; they cascade-delete with the
-- projected learning_items row on delete_all.

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

  update public.user_content_versions set version_state = 'superseded', updated_at = now()
    where content_item_id = p_content_id and version_state = 'published';
  update public.user_content_versions
    set version_state = 'published', published_at = now(), updated_at = now()
    where id = v_version.id;

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

  -- Replace projected choices. Always clear first so a type change (or a shrunk
  -- choice list) never leaves stale options; only multiple_choice re-projects.
  delete from public.learning_item_choices where learning_item_id = v_item_id;
  if v_item_type = 'multiple_choice' then
    insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
    select v_item_id || '.choice.' || (ord - 1)::text,
           v_item_id,
           coalesce(elem->>'text', ''),
           coalesce((elem->>'isCorrect')::boolean, false),
           (ord - 1)::integer
    from jsonb_array_elements(coalesce(v_payload->'choices', '[]'::jsonb)) with ordinality as t(elem, ord);
  end if;

  update public.user_content_items
    set lifecycle_status = 'published', current_published_version_id = v_version.id,
        current_draft_version_id = null, published_at = now(), updated_at = now()
    where id = p_content_id;

  return query select p_content_id, v_skill_id, v_item_id, v_version.version_number;
end;
$$;
