# ADR 0008: Goal Evaluation as Recommendation-Only Evidence

## Status

Accepted for #267 under roadmap #264.

## Context

Learners may have sparse, stale, or external C++ experience. Goal creation needs a low-stakes diagnostic that can improve recommendations without pretending to be a certification exam, mastery event, or FSRS review.

The browser cannot be trusted with answer keys, correctness, model updates, or next-item selection. Refreshes, retries, concurrent tabs, retired items, and a small diagnostic pool must all produce one deterministic sequence.

## Decision

Goal Evaluation uses separate user-owned session and response tables. A completed session contains exactly 30 unique choice-gradable learning items. It never writes normal learning attempts, review cards/logs, or mastery-bearing skill events.

The first algorithm is `goal-evaluation-v1`, an interpretable bounded Beta-style model. Recent trusted attempts/reviews, placement, and older attempts with reduced weight initialize each module; prior evidence is capped at two total weight units per module. A neutral prior contributes two correct-equivalent and two incorrect-equivalent weight units, so 30 new responses can overcome stale evidence. The prior sources and timestamps are snapshotted, and each committed answer updates a versioned per-module state containing evidence count, weighted estimate band, and uncertainty. Findings expire seven days after session start.

The opening seven questions are moderate-difficulty broad-coverage anchors. Later candidates are ranked by module uncertainty, difficulty fit, diagnostic weight, coverage deficit, item-type diversity, recent repetition, and whether the prior answer calls for a harder or easier probe. Stable module/item identifiers break ties. Selection excludes used and retired items and prevents three consecutive questions on one skill.

The database is authoritative. Start selects and persists the first item before returning it. Answer submission locks the owned active session, validates the expected question and selected choice, grades against the protected answer key, writes an idempotent response, updates model state, and persists the next item in one transaction. A submission UUID supports replay; a conflicting replay or stale tab is rejected. Active responses never return correctness.

Only answer-free diagnostic metadata is readable. RLS limits session and safe response reads to the owner; response correctness and selected choice remain unavailable through browser table reads. The superseded caller-driven RPC signatures are revoked.

At completion, per-module findings use named bands and reason codes rather than a global C++ percentage. Current findings preselect a small set of goal skills with a visible explanation. Learners may modify or ignore them. Evaluation records are recommendation-only evidence and never count as goal progress.

## Pool readiness and lifecycle

The pool must contain at least 30 active, unique, metadata-complete items with protected choices. Build-time catalog validation and the trusted start gate both reject an insufficient pool. One active session is allowed per learner. A start resumes it, an explicit abandon ends it, and an expired session is abandoned before a new one starts. An unanswered item retired during a pause is replaced transactionally and recorded in model state; answered history remains immutable.

`goal_evaluation_events` stores the stable `started`, `answered`, `resumed`, `abandoned`, `completed`, and `recommendations_viewed` lifecycle contract without adding these events to the mastery event union. Answer events reference the immutable response row for exposure/outcome calibration; outcomes remain available only to trusted aggregate work.

## Consequences

Benefits are deterministic replay, protected grading, recommendation transparency, and strict separation from learning progress. Tradeoffs are SQL-side selection logic and an intentionally uncalibrated first model. Future psychometric calibration requires a separate data threshold and review; it must version the algorithm rather than silently changing existing sessions.

Rollback disables the Evaluation entry point and trusted RPC grants while preserving sessions and responses for audit. No normal learning state needs repair because Evaluation never writes it.
