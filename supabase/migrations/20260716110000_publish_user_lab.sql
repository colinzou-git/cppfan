-- #489 Phase 3: allow publishing kind = 'lab'.
--
-- Extends publish_user_content so a project lab projects the same owner-scoped
-- skill + learning item as an exercise (participating in mastery/skill-map/
-- goals/recommendations), using the lab payload's taskDescription (falling back
-- to summary) as the prompt and a worked_example item type. Code Lab execution /
-- milestone running for a published lab is resolved dynamically from the payload
-- in the app layer (a later slice). Milestones are checkpoints inside the lab,
-- not separate skills, so no child projections are created for labs. Based on
-- the exercise version of the function; lesson/exercise behavior is unchanged.

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
  v_prompt text;
  v_explanation text;
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
  if v_item.kind not in ('lesson', 'exercise', 'lab') then
    raise exception 'only lessons, exercises and labs can be published in this phase' using errcode = '22023';
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

  v_title := coalesce(nullif(btrim(coalesce(v_payload->>'title', v_item.title)), ''), v_item.title);
  if v_item.kind = 'exercise' then
    v_item_type := 'worked_example';
    v_prompt := coalesce(nullif(v_payload->>'prompt', ''), v_title);
    v_explanation := v_payload->>'solutionExplanation';
  elsif v_item.kind = 'lab' then
    v_item_type := 'worked_example';
    v_prompt := coalesce(nullif(v_payload->>'taskDescription', ''), nullif(v_payload->>'summary', ''), v_title);
    v_explanation := v_payload->>'solutionExplanation';
  else
    v_item_type := coalesce(v_payload->>'itemType', 'lesson');
    v_prompt := coalesce(nullif(v_payload->>'content', ''), v_title);
    v_explanation := v_payload->>'explanation';
  end if;
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
    coalesce(nullif(v_explanation, ''), v_title), v_title, v_difficulty,
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
    v_item_id, v_item_type, v_title, v_prompt,
    v_explanation, v_difficulty, v_est, 0, true, v_user, p_content_id, v_version.id, 'user'
  )
  on conflict (id) do update set
    type = excluded.type, title = excluded.title, prompt = excluded.prompt,
    explanation = excluded.explanation, difficulty = excluded.difficulty,
    estimated_minutes = excluded.estimated_minutes, is_active = true,
    content_version_id = excluded.content_version_id, updated_at = now();

  insert into public.learning_item_skills (learning_item_id, skill_id, is_primary)
  values (v_item_id, v_skill_id, true)
  on conflict (learning_item_id, skill_id) do update set is_primary = true;

  if v_item.kind = 'lesson' then
    -- Interactive child projections: clear all three, then re-project the matching
    -- type. Answer-key columns are never selected by the public reads.
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

    delete from public.learning_item_parsons_blocks where learning_item_id = v_item_id;
    if v_item_type = 'parsons' then
      insert into public.learning_item_parsons_blocks (id, learning_item_id, content, correct_order, is_distractor)
      select v_item_id || '.block.' || (ord - 1)::text,
             v_item_id,
             coalesce(elem->>'text', ''),
             coalesce((elem->>'correctOrder')::integer, 0),
             coalesce((elem->>'isDistractor')::boolean, false)
      from jsonb_array_elements(coalesce(v_payload->'parsonsBlocks', '[]'::jsonb)) with ordinality as t(elem, ord);
    end if;

    delete from public.learning_item_completion_blanks where learning_item_id = v_item_id;
    if v_item_type = 'completion' then
      insert into public.learning_item_completion_blanks (id, learning_item_id, position, answer)
      select v_item_id || '.blank.' || (ord - 1)::text,
             v_item_id,
             coalesce((elem->>'position')::integer, (ord - 1)::integer),
             coalesce(elem->>'answer', '')
      from jsonb_array_elements(coalesce(v_payload->'completionBlanks', '[]'::jsonb)) with ordinality as t(elem, ord);
    end if;

    -- Project supplementary review questions as independent multiple_choice items.
    insert into public.learning_items (
      id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index,
      is_active, owner_user_id, content_item_id, content_version_id, source_kind
    )
    select v_item_id || '.review.' || (ord - 1)::text, 'multiple_choice',
           left(coalesce(nullif(elem->>'prompt', ''), 'Review question'), 200),
           coalesce(nullif(elem->>'prompt', ''), 'Review question'),
           elem->>'explanation', v_difficulty, 1, (ord - 1)::integer, true,
           v_user, p_content_id, v_version.id, 'user'
    from jsonb_array_elements(coalesce(v_payload->'reviewCards', '[]'::jsonb)) with ordinality as t(elem, ord)
    where jsonb_array_length(coalesce(elem->'choices', '[]'::jsonb)) >= 2
      and exists (select 1 from jsonb_array_elements(elem->'choices') c where (c->>'isCorrect')::boolean = true)
    on conflict (id) do update set
      type = 'multiple_choice', title = excluded.title, prompt = excluded.prompt,
      explanation = excluded.explanation, difficulty = excluded.difficulty, is_active = true,
      content_version_id = excluded.content_version_id, updated_at = now();

    insert into public.learning_item_skills (learning_item_id, skill_id, is_primary)
    select v_item_id || '.review.' || (ord - 1)::text, v_skill_id, true
    from jsonb_array_elements(coalesce(v_payload->'reviewCards', '[]'::jsonb)) with ordinality as t(elem, ord)
    where jsonb_array_length(coalesce(elem->'choices', '[]'::jsonb)) >= 2
      and exists (select 1 from jsonb_array_elements(elem->'choices') c where (c->>'isCorrect')::boolean = true)
    on conflict (learning_item_id, skill_id) do update set is_primary = true;

    delete from public.learning_item_choices where learning_item_id like v_item_id || '.review.%';
    insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
    select v_item_id || '.review.' || (rord - 1)::text || '.choice.' || (cord - 1)::text,
           v_item_id || '.review.' || (rord - 1)::text,
           coalesce(celem->>'text', ''),
           coalesce((celem->>'isCorrect')::boolean, false),
           (cord - 1)::integer
    from jsonb_array_elements(coalesce(v_payload->'reviewCards', '[]'::jsonb)) with ordinality as r(relem, rord)
         cross join lateral jsonb_array_elements(coalesce(relem->'choices', '[]'::jsonb)) with ordinality as c(celem, cord)
    where jsonb_array_length(coalesce(relem->'choices', '[]'::jsonb)) >= 2
      and exists (select 1 from jsonb_array_elements(relem->'choices') cc where (cc->>'isCorrect')::boolean = true);

    delete from public.learning_items li
    where li.id like v_item_id || '.review.%'
      and not exists (
        select 1 from jsonb_array_elements(coalesce(v_payload->'reviewCards', '[]'::jsonb)) with ordinality as t(elem, ord)
        where li.id = v_item_id || '.review.' || (ord - 1)::text
          and jsonb_array_length(coalesce(elem->'choices', '[]'::jsonb)) >= 2
          and exists (select 1 from jsonb_array_elements(elem->'choices') c where (c->>'isCorrect')::boolean = true)
      );
  end if;

  update public.user_content_items
    set lifecycle_status = 'published', current_published_version_id = v_version.id,
        current_draft_version_id = null, published_at = now(), updated_at = now()
    where id = p_content_id;

  return query select p_content_id, v_skill_id, v_item_id, v_version.version_number;
end;
$$;

revoke all on function public.publish_user_content(uuid, bigint) from public;
grant execute on function public.publish_user_content(uuid, bigint) to authenticated;
