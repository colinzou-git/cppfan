# cppFan dashboard E2E robust fix

This patch updates the dashboard E2E test so it passes in both valid local states:

1. Supabase is not configured:
   - `/dashboard` shows the scaffold dashboard.
   - Test checks the dashboard heading and setup warning.

2. Supabase is configured but no user is logged in:
   - `/dashboard` redirects to `/login`.
   - Test checks the login heading and login URL.

This is better because the scaffold should work whether `.env.local` is empty or already contains Supabase keys.

## Apply

Unzip at the repo root and overwrite files.

Then run:

```powershell
pnpm test:e2e
```
