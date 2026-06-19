# Study Goal Foundation

This implementation provides the durable storage, lifecycle, acquisition, and
daily-allocation boundary from ADR 0007.

## Implemented

- `study_goals` stable identity and lifecycle status
- immutable `study_goal_revisions`
- versioned, history-safe `study_goal_targets`
- append-only lifecycle audit records
- idempotency receipts and optimistic revision checks
- versioned, rebuildable initial-learning acquisition contracts
- deterministic Daily New allocation with persisted Learn Extra snapshots
- idempotent, concurrency-safe Learn Extra allocation
- explicit complete, reopen, and cancel lifecycle mutations
- user-owned RLS with browser reads only
- trusted create, revise, cancel, complete, reopen, and Learn Extra RPCs

## Trust boundaries

The trusted mutation path accepts active `acquire_skill` targets. The table
supports `complete_initial_application`, but those targets remain rejected until
a trusted adapter can validate TypeScript-backed exercise, capstone, and
interview catalog IDs. This prevents unvalidated client strings from becoming
durable goal targets.

Initial-learning progress is derived from qualifying learning-item evidence and
versioned acquisition contracts. Placement and Evaluation remain
recommendation-only. Goal lifecycle completion is a trusted, idempotent RPC;
the UI may request it only after the derived target state is complete. A click,
allocation row, or deadline never becomes learning evidence.

Daily allocation rows are reproducible plan snapshots, not learning evidence,
mastery, or FSRS state. Planned and Learn Extra work remain distinguishable,
and exact FSRS review actions are excluded from Daily New.

## Verification

Authenticated integration coverage exercises goal ownership, immutable
revision history, idempotent replay, stale-write rejection, lifecycle events,
and Learn Extra allocation concurrency against the disposable local Supabase
stack. Unit coverage verifies local-date/DST behavior, acquisition-state rebuild,
and Daily Review/Daily New exact-action separation.

## Rollback

Disable goal mutation calls and hide goal UI while retaining all rows. The
schema is additive and migrations are idempotent. Derived acquisition plans can
be rebuilt from canonical evidence and versioned contracts. Do not drop
historical revisions, allocation snapshots, or audit records as an application
rollback mechanism.
