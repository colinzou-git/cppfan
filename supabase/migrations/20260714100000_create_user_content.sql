-- #487 Phase 1: canonical private user-created content tables.
--
-- This is the DB foundation for user-authored content (lessons first; the model
-- is ready for exercises/labs/interview problems). Three owner-scoped tables:
--   user_content_items    - one row per authored item (identity + lifecycle)
--   user_content_versions - immutable version snapshots + the active draft
--   user_content_attachments - author-source / learner-resource attachments
--
-- All content is private to its owner in this release. user_id is stamped from
-- auth.users and every table has RLS restricting rows to the owning user, so no
-- learner can read or write another user's content, versions, or attachments.
-- Published projection into skills/learning_items, the trusted lifecycle RPCs,
-- and Storage policies land in later #487 slices; this slice only creates the
-- canonical tables so nothing here changes native curriculum behavior.

create table if not exists public.user_content_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('lesson', 'exercise', 'lab', 'interview_problem')),
  title text not null,
  native_module_id text,
  lifecycle_status text not null default 'draft'
    check (lifecycle_status in ('draft', 'published', 'archived')),
  recommendation_enabled boolean not null default true,
  current_draft_version_id uuid,
  current_published_version_id uuid,
  draft_revision bigint not null default 0,
  archived_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_content_versions (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.user_content_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  version_number integer not null,
  schema_version integer not null default 1,
  version_state text not null default 'draft'
    check (version_state in ('draft', 'published', 'superseded')),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (content_item_id, version_number)
);

create table if not exists public.user_content_attachments (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.user_content_items(id) on delete cascade,
  version_id uuid references public.user_content_versions(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  attachment_kind text not null
    check (attachment_kind in ('file', 'image', 'pdf', 'url', 'github_url', 'lesson_ref')),
  visibility text not null default 'author_source'
    check (visibility in ('author_source', 'learner_resource')),
  storage_path text,
  external_url text,
  referenced_learning_item_id text,
  filename text,
  mime_type text,
  size_bytes bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Circular pointers from the item to its current draft/published version. Added
-- after both tables exist; guarded so re-running the migration is a no-op.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'user_content_items_current_draft_version_fk'
  ) then
    alter table public.user_content_items
      add constraint user_content_items_current_draft_version_fk
      foreign key (current_draft_version_id)
      references public.user_content_versions(id) on delete set null;
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'user_content_items_current_published_version_fk'
  ) then
    alter table public.user_content_items
      add constraint user_content_items_current_published_version_fk
      foreign key (current_published_version_id)
      references public.user_content_versions(id) on delete set null;
  end if;
end $$;

create index if not exists user_content_items_owner_idx
  on public.user_content_items(user_id, kind, lifecycle_status, updated_at desc);
create index if not exists user_content_items_reco_idx
  on public.user_content_items(user_id, recommendation_enabled, lifecycle_status);
create index if not exists user_content_versions_item_idx
  on public.user_content_versions(content_item_id, version_number desc);
create index if not exists user_content_attachments_item_vis_idx
  on public.user_content_attachments(content_item_id, visibility);

-- RLS: every row is private to its owner.
alter table public.user_content_items enable row level security;
alter table public.user_content_versions enable row level security;
alter table public.user_content_attachments enable row level security;

-- user_content_items
drop policy if exists "owners read own content items" on public.user_content_items;
create policy "owners read own content items"
  on public.user_content_items for select using (auth.uid() = user_id);
drop policy if exists "owners insert own content items" on public.user_content_items;
create policy "owners insert own content items"
  on public.user_content_items for insert with check (auth.uid() = user_id);
drop policy if exists "owners update own content items" on public.user_content_items;
create policy "owners update own content items"
  on public.user_content_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "owners delete own content items" on public.user_content_items;
create policy "owners delete own content items"
  on public.user_content_items for delete using (auth.uid() = user_id);

-- user_content_versions
drop policy if exists "owners read own content versions" on public.user_content_versions;
create policy "owners read own content versions"
  on public.user_content_versions for select using (auth.uid() = user_id);
drop policy if exists "owners insert own content versions" on public.user_content_versions;
create policy "owners insert own content versions"
  on public.user_content_versions for insert with check (auth.uid() = user_id);
drop policy if exists "owners update own content versions" on public.user_content_versions;
create policy "owners update own content versions"
  on public.user_content_versions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "owners delete own content versions" on public.user_content_versions;
create policy "owners delete own content versions"
  on public.user_content_versions for delete using (auth.uid() = user_id);

-- user_content_attachments
drop policy if exists "owners read own content attachments" on public.user_content_attachments;
create policy "owners read own content attachments"
  on public.user_content_attachments for select using (auth.uid() = user_id);
drop policy if exists "owners insert own content attachments" on public.user_content_attachments;
create policy "owners insert own content attachments"
  on public.user_content_attachments for insert with check (auth.uid() = user_id);
drop policy if exists "owners update own content attachments" on public.user_content_attachments;
create policy "owners update own content attachments"
  on public.user_content_attachments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "owners delete own content attachments" on public.user_content_attachments;
create policy "owners delete own content attachments"
  on public.user_content_attachments for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.user_content_items to authenticated;
grant select, insert, update, delete on public.user_content_versions to authenticated;
grant select, insert, update, delete on public.user_content_attachments to authenticated;

comment on table public.user_content_items is
  'Private user-created content items (#487); one row per authored item. RLS restricts rows to the owning user.';
comment on table public.user_content_versions is
  'Immutable/draft version snapshots for user_content_items (#487); owner-scoped via RLS.';
comment on table public.user_content_attachments is
  'Author-source/learner-resource attachments for user content (#487); owner-scoped via RLS.';
