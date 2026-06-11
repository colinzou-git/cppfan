# ADR 0003: Use Event Ledger Plus FSRS

## Status

Accepted.

## Context

cppFan needs both memory review scheduling and skill mastery tracking.

A spaced repetition scheduler can decide when a review item should appear again. It cannot fully explain whether a broad skill is mastered, because a skill may include quizzes, code reading, debugging, hints, repeated mistakes, and practice tasks.

## Decision

Use two connected systems:

1. FSRS review cards for review timing.
2. A learning event ledger for skill mastery and weakness detection.

## FSRS responsibility

FSRS should manage:

- Review card state
- Due dates
- Review ratings
- Review history
- Next scheduled review

## Event ledger responsibility

The event ledger should record actions such as:

- Lesson started
- Concept viewed
- Quiz submitted
- Correct answer
- Incorrect answer
- Hint used
- Review completed
- Practice attempted
- Practice completed
- Skill mastered
- Skill regressed

## Why separate them

Keeping these systems separate makes the app easier to reason about.

FSRS can stay focused on review timing.

The mastery engine can use a broader set of learning signals.

## Consequences

Benefits:

- Better weak-skill detection
- Better recommendations
- Easier analytics
- Cleaner architecture
- Easier future improvements

Tradeoffs:

- More tables
- More event validation
- More tests needed

## Implementation notes

The FSRS wrapper should live in its own module. Event logging should also be isolated so UI features can log events without duplicating logic.
