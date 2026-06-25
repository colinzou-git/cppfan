-- #441: Preflight integrity guard for skill_events.event_type.
--
-- Background: a normal `ALTER TABLE ... ADD CONSTRAINT ... CHECK (...)` validates
-- existing rows immediately. When production has a legacy/typo event_type outside
-- the stable allowlist, the June 14 constraint rewrite
-- (20260614540000_error_pattern_events.sql) fails with an opaque
-- "violates check constraint" and blocks every later migration.
--
-- This migration adds a self-contained preflight that fails LOUDLY and
-- ACTIONABLY (grouped bad values + counts) if any row is outside the canonical
-- allowlist. In a correctly-migrated database (including a fresh CI database,
-- which has no skill_events rows) there are zero invalid rows, so this is a
-- no-op. It cannot retroactively unblock the older failing migration on
-- production; that requires the one-time manual reconciliation in
-- scripts/db/reconcile-invalid-skill-event-types.sql. Its value is to make any
-- FUTURE drift fail with a clear message instead of a constraint violation, and
-- to assert the invariant on every replay.
--
-- The allowlist below MUST stay in lockstep with:
--   - src/features/events/event-names.ts (SKILL_EVENT_NAMES, the canonical list)
--   - docs/EVENT_SCHEMA_STABLE_NAMES.md
--   - the final skill_events_event_type_check constraint
-- A unit test (tests/unit/event-names.test.ts) parses this file and fails if the
-- allowlist drifts from SKILL_EVENT_NAMES.

do $$
declare
  v_bad text;
begin
  -- Skip silently if skill_events does not yet exist (defensive; the table is
  -- created by 20260613110000_create_skill_events.sql, which runs earlier).
  if to_regclass('public.skill_events') is null then
    return;
  end if;

  select string_agg(event_type || ':' || row_count, ', ' order by event_type)
    into v_bad
  from (
    select event_type, count(*)::text as row_count
      from public.skill_events
      where event_type not in (
        'lesson_started',
        'concept_seen',
        'quiz_attempted',
        'quiz_correct',
        'quiz_wrong',
        'hint_used',
        'review_completed',
        'code_attempted',
        'code_passed',
        'skill_mastered',
        'skill_regressed',
        'error_pattern_observed',
        'error_pattern_cleared',
        'worked_example_viewed',
        'completion_submitted',
        'parsons_submitted',
        'parsons_hint_used',
        'parsons_checked',
        'capstone_milestone_started',
        'capstone_milestone_completed',
        'capstone_reflection_submitted',
        'placement_started',
        'placement_completed',
        'placement_reset'
      )
      group by event_type
  ) invalid_event_types;

  if v_bad is not null then
    raise exception using
      errcode = 'check_violation',
      message = 'skill_events has event_type values outside the stable allowlist: '
        || v_bad,
      hint = 'Run scripts/db/reconcile-invalid-skill-event-types.sql against this '
        || 'database to quarantine and remap legacy rows, then re-run migrations. '
        || 'Do not weaken skill_events_event_type_check.';
  end if;

  raise notice 'skill_events event_type integrity OK (no rows outside the stable allowlist)';
end $$;
