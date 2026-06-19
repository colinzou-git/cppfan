drop policy if exists "diagnostic_attempts_delete_own" on public.diagnostic_attempts;

create policy "diagnostic_attempts_delete_own"
on public.diagnostic_attempts
for delete
to authenticated
using ((select auth.uid()) = user_id);

grant delete on public.diagnostic_attempts to authenticated;
