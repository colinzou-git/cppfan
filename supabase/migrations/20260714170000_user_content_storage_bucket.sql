-- Purpose (#487): a private Supabase Storage bucket for user-content attachments
-- (uploaded files, screenshots/images, PDFs) plus owner-scoped RLS on
-- storage.objects. Object paths are owner-namespaced as
--   <user-id>/<content-item-id>/<attachment-id>/<safe-filename>
-- so the first path segment is the owner. The bucket is private (no public
-- URLs); downloads use signed/authenticated access. Enforcement lives in
-- storage.objects RLS here and in the attachment-metadata table RLS already
-- created for user_content_attachments.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-content-attachments',
  'user-content-attachments',
  false,
  26214400, -- 25 MiB per object; no product-level quota, just a safety cap
  array[
    'image/png', 'image/jpeg', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'text/markdown'
  ]
)
on conflict (id) do nothing;

-- Owner-scoped policies: an authenticated user may only touch objects in this
-- bucket whose first path segment equals their own uid. Anonymous users and
-- other authenticated users get nothing.
drop policy if exists "user content attachments select own" on storage.objects;
create policy "user content attachments select own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'user-content-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "user content attachments insert own" on storage.objects;
create policy "user content attachments insert own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'user-content-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "user content attachments update own" on storage.objects;
create policy "user content attachments update own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'user-content-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'user-content-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "user content attachments delete own" on storage.objects;
create policy "user content attachments delete own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'user-content-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
