# ADR 0007: Goals, Acquisition State, and Daily New Allocation

## Status

Proposed. Tracks #265 under roadmap #264. Coordinates with #266, #269, #270, and #272.

## Context

cppFan already separates FSRS review scheduling, skill mastery, and the learning-event ledger. Dated goals add a different concern: which unfinished initial-learning or initial-application work a learner intends to complete within a local calendar range.

Goals must not become a second mastery model, a second review scheduler, or a client-writable completion ledger. Existing `profiles.learning_goals` remains the onboarding interest array. Existing `daily_new_skills_goal` remains a baseline preference, and Learn Extra never changes it.

## Decision

Use additive, user-owned entities with immutable revisions:

- `study_goals`: stable goal identity, owner, title, lifecycle status, and current revision;
- `study_goal_revisions`: immutable date, timezone, algorithm, recommendation-reason, and note snapshots;
- `study_goal_targets`: ordered skill or catalog-backed application targets for one revision;
- `study_goal_events`: append-only create/revise/complete/expire/cancel audit records;
- `study_goal_daily_allocations`: versioned planned and Learn Extra action snapshots.

Goal lifecycle records remain separate from mastery-bearing `skill_events` unless an action is independently valid skill evidence.

## Dates and revisions

Every edit creates a new revision. Prior revisions remain queryable. A revision snapshots an IANA timezone, start local date, and inclusive end local date. A seven-day goal beginning on local date D covers D through D+6. A later profile-timezone change affects new revisions only.

Duration is constrained to 1–30 inclusive calendar days. Deadline passage may make a goal expired, but never completed. Expiry may be derived on read and finalized idempotently later; no new cron service is required.

## Targets and catalog compatibility

Each target has:

- target kind: `acquire_skill` or `complete_initial_application`;
- stable skill id or validated catalog-backed application id;
- order and optional weight;
- acquisition-contract id/version;
- recommendation source;
- baseline state and evidence cutoff;
- historical title/catalog snapshot for tombstone display.

Modules are expanded to stable ordered skill targets at revision creation because modules are seed metadata rather than a relational table. Retired targets remain readable in history. Review, maintenance, and recovery are not Daily New target kinds.

## Versioned acquisition contracts

Every target resolves to a typed contract defining required and optional steps, order, eligible item/catalog versions, valid evidence, any initial-application requirement, and explicit equivalence rules.

Derived acquisition state is one of:

- `not_started`;
- `in_progress`;
- `initial_learning_complete`;
- `unavailable`.

Acquisition state is not mastery and is not FSRS state. Initial learning may be complete while mastery remains weak and future FSRS reviews remain due. Page views, clicks, allocation, placement, and Evaluation never complete a step. One correct answer finishes a multi-step target only when the contract explicitly says it is sufficient.

## Canonical evidence adapter

Goal progress reads a typed projection over canonical sources rather than copying all evidence into goal tables. Each evidence record exposes a stable key/source id, owner, target/skill, timestamp, action and activity type, trustworthy outcome, hint/independence metadata when available, source, confidence class, and contract-step mapping.

Confidence classes are:

- `trusted_transactional`: server-graded attempts and committed review logs;
- `trusted_server_reconciled`: validated results imported from a trusted subsystem;
- `learner_attested`: currently self-reported exercise, capstone, or interview progress;
- `recommendation_only`: placement and Evaluation, which never count as progress.

Contracts state which classes they accept. One evidence record may advance multiple overlapping goals, but aggregate statistics deduplicate by evidence key.

Evidence before a revision baseline does not count as work completed during that revision. Existing progress reduces remaining work and is shown separately. An already-complete retained target is labeled `already satisfied`, not fabricated as new goal work.

## Daily Review boundary

Daily Review remains selected only from due FSRS cards. Daily New for Goals contains only unfinished acquisition actions. An exact FSRS review action is never stored as a Daily New allocation.

Exact identity uses review card id, learning item id, and committed review-log/submission identity. Non-review work uses its trusted evidence id plus a stable allocator action id. Matching by skill id or title alone is forbidden.

## Daily allocations and Learn Extra

A daily allocation snapshot contains local date/timezone, goal/revision/target ids, stable action and contract-step ids, source (`planned` or `learn_extra`), destination, algorithm/contract versions, timestamps, and status (`allocated`, `satisfied`, `dismissed`, `superseded`, or `expired`). Satisfaction evidence is server-authored and reconciled from canonical evidence.

Allocation is not proof of correctness, mastery, acquisition completion, or review completion. Opening an action never advances progress.

Learn Extra is an authenticated, idempotent operation. It accepts a submission id and expected daily-plan version, validates active unfinished goal scope, atomically reserves one next eligible action, advances the version, and returns the result. Replay returns the same action. A stale request returns a typed conflict. Concurrent tabs cannot reserve the same candidate twice.

## Mutation, ownership, and history

Create, revise, cancel, and complete operations:

- accept an idempotency id;
- derive the authenticated learner inside the trusted boundary;
- require the expected current revision for edits;
- write goal, revision, targets, and audit record atomically;
- reject stale writes and invalid catalog references;
- preserve prior revisions.

All goal data is user-owned, protected by RLS, and removed with account deletion. Direct browser writes to revision numbers, audit fields, allocation source, satisfaction evidence, and derived progress are forbidden.

## Rollover and failure states

Daily rollover uses calendar boundaries in the revision timezone, including DST. Prior-day unfinished actions may be superseded or reallocated but are never marked complete automatically.

Typed service results distinguish signed-out, unconfigured, pre-migration/schema unavailable, configured database failure, and configured success with no goals. A configured failure must not appear as plausible empty personalized data.

History is paginated. Queries avoid per-target N+1 reads and add indexes for active/deadline lookup, revisions, targets, local-day allocations, and idempotency keys.

## Rebuild and rollback

Canonical evidence is the source of truth. Acquisition caches, summaries, and allocation satisfaction are versioned and rebuildable.

Rollout order:

1. ADR and typed contracts;
2. tables, RLS, trusted mutations, and migration tests;
3. evidence adapter and rebuild tests;
4. deterministic recommendation/allocation engine;
5. UI and authenticated end-to-end coverage.

Application rollback disables goal writes and hides the feature while preserving history. Migrations are idempotent. User history is not destructively dropped during rollback.

## Consequences

Benefits: explainable history, clean separation from FSRS/mastery, deterministic retries and overlapping-goal behavior, and rebuildable progress.

Tradeoffs: more relational entities, versioned contracts, transactional mutations, tombstone snapshots, and mandatory concurrency/DST tests.

## Required verification

Implementation must cover migration, RLS, cross-user rejection, idempotency, stale revisions, overlapping-goal deduplication, pagination, rebuild, pre-migration/configured-failure behavior, local-midnight/DST rollover, multiple active goals, Learn Extra, and revision history. `pnpm verify:codespace` must pass.

## Non-goals

- Reimplementing mastery scoring.
- Moving FSRS state into goal tables.
- Treating review completion as unfinished acquisition completion.
- Treating allocation/opening as evidence.
- Changing `daily_new_skills_goal` through Learn Extra.
- Deleting historical revisions when a goal changes.
