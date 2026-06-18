-- Shared curriculum tables are public read-only data protected by RLS policies,
-- but fresh local/self-hosted Postgres still needs explicit base SELECT grants.
-- Hosted Supabase may provide ambient defaults; the disposable local stack used
-- by authenticated browser E2E does not. Keep answer-bearing columns locked.

grant select on public.skills to anon, authenticated;
grant select on public.skill_prerequisites to anon, authenticated;
grant select on public.learning_items to anon, authenticated;
grant select on public.learning_item_skills to anon, authenticated;

-- Do not grant table-wide SELECT on choices because is_correct is the answer key.
grant select (id, learning_item_id, content, order_index, created_at)
on public.learning_item_choices
to anon, authenticated;
