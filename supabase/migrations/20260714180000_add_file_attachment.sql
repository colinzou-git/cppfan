-- #487 Phase 1: server-authoritative write path for uploaded file/image/PDF
-- attachments. The client uploads the bytes to the private
-- user-content-attachments Storage bucket at
--   <uid>/<content-item-id>/<attachment-id>/<safe-filename>
-- then calls this RPC to record the metadata row. Ownership is enforced here
-- (the caller must own the content item) and the storage path must live under
-- the caller's own uid + this content item, matching the Storage RLS.

create or replace function public.add_file_attachment(
  p_content_id uuid,
  p_kind text,
  p_visibility text,
  p_storage_path text,
  p_filename text,
  p_mime_type text,
  p_size_bytes bigint
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
  v_folder text[];
begin
  if v_user is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if p_kind is null or p_kind not in ('file', 'image', 'pdf') then
    raise exception 'invalid file attachment kind' using errcode = '22023';
  end if;
  if p_visibility is null or p_visibility not in ('author_source', 'learner_resource') then
    raise exception 'invalid visibility' using errcode = '22023';
  end if;

  select user_id into v_owner from public.user_content_items where id = p_content_id;
  if v_owner is null or v_owner <> v_user then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if p_storage_path is null or length(btrim(p_storage_path)) = 0 then
    raise exception 'a storage path is required' using errcode = '22023';
  end if;
  v_folder := storage.foldername(p_storage_path);
  if v_folder[1] is distinct from v_user::text or v_folder[2] is distinct from p_content_id::text then
    raise exception 'storage path must live under the owner and content item' using errcode = '22023';
  end if;

  if p_size_bytes is null or p_size_bytes <= 0 or p_size_bytes > 26214400 then
    raise exception 'file size out of range' using errcode = '22023';
  end if;

  insert into public.user_content_attachments (
    content_item_id, user_id, attachment_kind, visibility, storage_path, filename, mime_type, size_bytes
  ) values (
    p_content_id, v_user, p_kind, p_visibility, btrim(p_storage_path), p_filename, p_mime_type, p_size_bytes
  ) returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.add_file_attachment(uuid, text, text, text, text, text, bigint) from public;
grant execute on function public.add_file_attachment(uuid, text, text, text, text, text, bigint) to authenticated;
