-- #487 Phase 1: trusted RPCs for external (non-file) user-content attachments.
--
-- The user_content_attachments table + owner RLS already exist. This slice adds
-- the server-authoritative write path for the URL / GitHub-URL / lesson-reference
-- attachment kinds: each stamps user_id from auth.uid(), verifies the owner owns
-- the content item, and validates the input (https-only URLs; a lesson ref must
-- name a learning item). Uploaded file/image/PDF kinds need a private Storage
-- bucket + policies and land in a later slice.

create or replace function public.add_external_attachment(
  p_content_id uuid,
  p_kind text,
  p_visibility text,
  p_external_url text,
  p_referenced_learning_item_id text,
  p_filename text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_owner uuid;
  v_id uuid;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if p_kind is null or p_kind not in ('url', 'github_url', 'lesson_ref') then
    raise exception 'invalid external attachment kind' using errcode = '22023';
  end if;
  if p_visibility is null or p_visibility not in ('author_source', 'learner_resource') then
    raise exception 'invalid visibility' using errcode = '22023';
  end if;

  select user_id into v_owner from public.user_content_items where id = p_content_id;
  if v_owner is null or v_owner <> v_user then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if p_kind in ('url', 'github_url') then
    if p_external_url is null or p_external_url !~* '^https://' then
      raise exception 'external URLs must be https' using errcode = '22023';
    end if;
  else
    if p_referenced_learning_item_id is null or length(btrim(p_referenced_learning_item_id)) = 0 then
      raise exception 'lesson reference requires a learning item id' using errcode = '22023';
    end if;
  end if;

  insert into public.user_content_attachments (
    content_item_id, user_id, attachment_kind, visibility, external_url, referenced_learning_item_id, filename
  ) values (
    p_content_id, v_user, p_kind, p_visibility,
    case when p_kind in ('url', 'github_url') then p_external_url else null end,
    case when p_kind = 'lesson_ref' then btrim(p_referenced_learning_item_id) else null end,
    p_filename
  ) returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.set_attachment_visibility(p_attachment_id uuid, p_visibility text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_owner uuid;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if p_visibility is null or p_visibility not in ('author_source', 'learner_resource') then
    raise exception 'invalid visibility' using errcode = '22023';
  end if;
  select user_id into v_owner from public.user_content_attachments where id = p_attachment_id;
  if v_owner is null or v_owner <> v_user then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  update public.user_content_attachments set visibility = p_visibility where id = p_attachment_id;
end;
$$;

create or replace function public.delete_attachment(p_attachment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := (select auth.uid());
  v_owner uuid;
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  select user_id into v_owner from public.user_content_attachments where id = p_attachment_id;
  if v_owner is null or v_owner <> v_user then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  delete from public.user_content_attachments where id = p_attachment_id;
end;
$$;

revoke all on function public.add_external_attachment(uuid, text, text, text, text, text) from public;
grant execute on function public.add_external_attachment(uuid, text, text, text, text, text) to authenticated;
revoke all on function public.set_attachment_visibility(uuid, text) from public;
grant execute on function public.set_attachment_visibility(uuid, text) to authenticated;
revoke all on function public.delete_attachment(uuid) from public;
grant execute on function public.delete_attachment(uuid) to authenticated;
