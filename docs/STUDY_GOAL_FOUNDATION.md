# Study Goal Foundation

This slice implements the durable storage and mutation boundary from ADR 0007.

## Implemented

- `study_goals` stable identity and lifecycle status
- immutable `study_goal_revisions`
- versioned, history-safe `study_goal_targets`
- append-only lifecycle audit records
- idempotency receipts and optimistic revision checks
- daily-allocation snapshot storage for later #266/#270 logic
- user-owned RLS with browser reads only
- trusted create, revise, and cancel RPCs

## Deliberate first-slice boundary

The trusted mutation path currently accepts active `acquire_skill` targets only. The table supports `complete_initial_application`, but those targets remain rejected until a trusted adapter can validate TypeScript-backed exercise, capstone, and interview catalog IDs. This prevents unvalidated client strings from becoming durable goal targets.

Goal completion is also deferred. Completion must be derived from the canonical evidence adapter and versioned acquisition contracts; a client must never mark a goal complete merely by clicking a button.

Daily allocation rows are not learning evidence, mastery, or FSRS state. Allocation and satisfaction mutations arrive with the deterministic recommendation engine in #266.

## Rollback

Disable goal mutation calls and hide goal UI while retaining all rows. The schema is additive and migrations are idempotent. Do not drop historical revisions or audit records as an application rollback mechanism.
