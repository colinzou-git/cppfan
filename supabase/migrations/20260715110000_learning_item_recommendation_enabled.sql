-- #487 Phase 1: respect recommendation_enabled for user content in automatic
-- recommendations while preserving manual access.
--
-- The flag lives on user_content_items but the recommendation/daily-new reads go
-- through the projected learning_items rows. Rather than rewrite the publish
-- projection, a BEFORE trigger keeps learning_items.recommendation_enabled in
-- sync with the owning content item on every insert/update. Native rows
-- (content_item_id is null) stay null and are always recommendable; only a user
-- item explicitly set to false is filtered out of auto-recommendations. The item
-- stays is_active, so it remains directly learnable.

alter table public.learning_items
  add column if not exists recommendation_enabled boolean;

create or replace function public.sync_learning_item_recommendation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.content_item_id is not null then
    select uci.recommendation_enabled into new.recommendation_enabled
      from public.user_content_items uci
      where uci.id = new.content_item_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_learning_item_recommendation on public.learning_items;
create trigger trg_sync_learning_item_recommendation
  before insert or update on public.learning_items
  for each row execute function public.sync_learning_item_recommendation();

-- Backfill any already-projected rows.
update public.learning_items li
  set recommendation_enabled = uci.recommendation_enabled
  from public.user_content_items uci
  where li.content_item_id = uci.id
    and li.recommendation_enabled is distinct from uci.recommendation_enabled;
