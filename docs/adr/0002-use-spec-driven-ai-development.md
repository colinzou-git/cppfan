# ADR 0002: Use Spec Driven Project Work

## Status

Accepted.

## Context

cppFan will be built through small GitHub issues, focused pull requests, automated checks, and Claude Code. To keep changes safe, each feature needs clear requirements before implementation.

## Decision

Every meaningful feature should start from a spec or issue that defines:

- Problem
- Scope
- Non goals
- Allowed edit zones
- Acceptance criteria
- Required tests
- Rollback plan

Claude Code should read the relevant spec before editing and should state the intended edit scope.

## Workflow

1. Create or choose an issue.
2. Read project docs.
3. Read the relevant spec.
4. Define allowed edit zones.
5. Implement the smallest useful change.
6. Add or update tests.
7. Open a pull request.
8. Use CI results for the next fix loop.

## Consequences

Benefits:

- Better project memory
- Less unrelated change
- Easier review
- Easier rollback
- Stronger connection between requirements and tests

Tradeoffs:

- More planning before coding
- Specs must be maintained as the app changes
