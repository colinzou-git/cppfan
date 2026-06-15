-- Make per-user table privileges explicit instead of relying on Supabase ambient
-- default privileges (#96).
--
-- The app reads/writes these tables as the authenticated role, and RLS scopes the
-- rows. Hosted Supabase grants base table privileges to anon/authenticated via
-- project default privileges, so prod works; but a fresh database (the disposable
-- local stack used by the authenticated integration tests, and any self-hosted
-- Postgres) does not get those grants, and access fails with 42501. Earlier
-- migrations even worked around this implicitly (the CI RLS smoke granted SELECT
-- inline). Granting explicitly here makes the schema self-contained on ANY
-- Postgres while preserving the server-authoritative model and the answer-key
-- lockdown:
--   * INSERT on attempts / skill_events / review_logs stays REVOKED (those are
--     written only by SECURITY DEFINER RPCs) — this migration grants SELECT only.
--   * learning_item_choices is intentionally NOT touched (its is_correct column
--     stays locked; safe columns were granted by the answer-key migration).
-- Idempotent: GRANT is repeatable.

-- Read-only per-user evidence (writes go through RPCs; INSERT remains revoked).
grant select on public.learning_item_attempts to authenticated;
grant select on public.skill_events to authenticated;
grant select on public.review_logs to authenticated;

-- Review cards: the client enrolls (upsert) and reads its own cards; ratings go
-- through the apply_review_rating RPC.
grant select, insert, update, delete on public.review_cards to authenticated;

-- Profile and capstone progress are client-managed per-user rows under RLS.
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.capstone_milestone_progress to authenticated;
