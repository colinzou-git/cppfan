# cppFan Learning Events

cppFan should record important learning actions so the app can understand progress over time.

This document is a first draft. The future database table will likely be named `skill_events`.

## Why events matter

Review scheduling and mastery tracking are not the same thing.

Review scheduling decides when an item should appear again.

Learning events describe what the learner actually did.

## Initial events

- lesson started
- concept viewed
- quiz submitted
- quiz answered correctly
- quiz answered incorrectly
- hint used
- review completed
- practice attempted
- practice completed
- skill marked mastered
- skill marked regressed

## Common fields

- event id
- user id
- skill id
- learning item id
- review card id
- event name
- event time
- extra details
- creation time

## Rules

- Events should belong to one user.
- Events should usually connect to one skill.
- Events should be append-only.
- Extra details should be small.
- Extra details should not include secrets.

## How events support mastery

Positive signals include correct answers, successful reviews, and repeated success over multiple days.

Negative signals include wrong answers, repeated mistakes, hints, and regression after previous success.

The app should use these signals to show weak skills, strong skills, mastered skills, and skills that need more review.

## event_type integrity and reconciliation (#441)

`public.skill_events.event_type` is constrained to the stable allowlist in
[`EVENT_SCHEMA_STABLE_NAMES.md`](EVENT_SCHEMA_STABLE_NAMES.md), enforced by the
`skill_events_event_type_check` constraint. The canonical source is
`src/features/events/event-names.ts` (`SKILL_EVENT_NAMES`); a unit test
(`tests/unit/event-names.test.ts`) fails if the DB constraint, the preflight
migration, or the smoke guard drift from it.

A normal `ADD CONSTRAINT ... CHECK` validates existing rows immediately, so a
single legacy/typo production row outside the allowlist makes the constraint
rewrite — and every later migration — fail with an opaque
`violates check constraint`. To make this actionable:

- `supabase/migrations/20260625120000_preflight_skill_event_type_integrity.sql`
  fails loudly with the offending values and counts if any row is outside the
  allowlist. In a clean database (including fresh CI) it is a no-op.
- `scripts/ci/smoke.sql` asserts zero invalid rows and that the constraint
  exists, after all migrations apply in CI.

### Reconciling invalid production rows

If the production **Deploy database migrations** workflow fails on the
`skill_events_event_type_check` rewrite, a legacy row needs reconciliation. This
is a manual, one-time, auditable step (it touches production data, so it is not
run by CI):

1. Inspect the offending values first (read-only):

   ```sql
   select event_type, count(*)
   from public.skill_events
   where event_type not in ( /* the stable allowlist */ )
   group by event_type order by count(*) desc;
   ```

2. Run the reconciliation script against production:

   ```bash
   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 \
     -f scripts/db/reconcile-invalid-skill-event-types.sql
   ```

   It runs in one transaction: it copies every invalid row into
   `public.skill_events_event_type_reconciliation_audit` before mutation, remaps
   known legacy spellings (e.g. `quizAttempted` → `quiz_attempted`) to stable
   names while preserving the original in `metadata.reconciled_from_event_type`,
   and **fails and rolls back** if any unknown value remains — production is left
   untouched until a human adds a justified mapping or handles the row.

3. Re-run the **Deploy database migrations** workflow. It should now be green.

The constraint is never weakened and no free-form `event_type` is allowed.
