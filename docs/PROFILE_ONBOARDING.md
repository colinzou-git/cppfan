# Profile and Onboarding

This feature adds the first user-specific state after Supabase Auth.

## Implemented

- `public.profiles` table migration.
- Row-level security policies.
- Onboarding route: `/onboarding`.
- Profile settings route: `/profile`.
- Dashboard gate:
  - No Supabase config: dashboard scaffold remains visible.
  - Supabase configured, no user: redirect to login.
  - User signed in, no completed profile: redirect to onboarding.
  - User signed in with completed profile: show dashboard.
- Server action to upsert profile preferences.
- Playwright smoke tests for onboarding/profile routing.

## Profile fields

| Field | Purpose |
|---|---|
| `id` | Same UUID as `auth.users.id` |
| `email` | User email snapshot |
| `display_name` | User-facing name |
| `experience_level` | Beginner/intermediate signal for recommendations |
| `daily_new_skills_goal` | Baseline new-skill preference; Learn Extra may exceed it for one day without changing it |
| `daily_review_minutes` | Daily Review load preference, separate from new goal learning |
| `learning_goals` | Backward-compatible selected learning interests, not dated Goals |
| `preferred_platforms` | Windows/iPad/iPhone preference |
| `onboarding_completed` | Dashboard gate |
| `onboarding_completed_at` | Completion timestamp |

## RLS model

Each authenticated learner can:

- select their own profile row
- insert their own profile row
- update their own profile row

No learner can read or write another learner's profile.

## Apply migration

Use:

```text
supabase/migrations/20260611113000_create_profiles.sql
```

For first setup, using Supabase SQL Editor is simplest:

1. Open Supabase project.
2. Go to SQL Editor.
3. Paste the migration file.
4. Run it.
5. Confirm `public.profiles` exists.

## Manual QA

With Supabase configured and the migration applied:

1. Sign in from `/login`.
2. Visit `/dashboard`.
3. You should be redirected to `/onboarding`.
4. Fill the form.
5. Submit.
6. You should land on `/dashboard`.
7. Dashboard should show your name, daily new skills, review minutes, and sign-out.
8. Open `/profile`.
9. Update settings and save.
10. Return to dashboard.

## Non-goals

- No skill map table yet.
- No quiz/review tables yet.
- No FSRS scheduling yet.
- No mastery calculation yet.
