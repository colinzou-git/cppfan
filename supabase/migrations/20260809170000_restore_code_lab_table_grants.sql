-- Restore the table privileges required by the existing owner-scoped RLS
-- policies. The original Code Lab attempt/draft migrations created policies
-- but did not grant the authenticated role access to the tables, so PostgREST
-- rejected every read/write before RLS could evaluate ownership.

revoke all on table public.code_lab_attempts from anon;
revoke all on table public.code_lab_drafts from anon;

grant select, insert on table public.code_lab_attempts to authenticated;
grant select, insert, update, delete on table public.code_lab_drafts to authenticated;

-- Test/maintenance clients use the service role for scoped verification and
-- cleanup. RLS remains the authoritative boundary for authenticated learners.
grant select on table public.code_lab_attempts to service_role;
grant select, insert, update, delete on table public.code_lab_drafts to service_role;
