---
name: Implementation or bug
about: Define product behavior, implementation boundaries, and required validation environments
title: ""
labels: ""
assignees: ""
---

## Purpose

Describe the user or developer problem and the expected outcome.

## Current behavior

Describe the current code/workflow and why it is insufficient.

## Expected behavior / UX

Describe the complete user-visible or developer-visible workflow.

## Required validation environments

Select every environment required by the acceptance criteria. See
`docs/TEST_ENVIRONMENTS.md`.

- [ ] Unit/component
- [ ] Public browser without backend
- [ ] Authenticated browser with disposable local Supabase
- [ ] Database migration/integration smoke
- [ ] Production operator verification

For every checked environment, identify the planned command/spec/job:

- Unit/component:
- Public browser:
- Authenticated browser:
- DB/integration:
- Production operator:

## Design

Include data flow, state transitions, error behavior, mobile behavior, and
learning/FSRS/mastery rules where relevant.

## File-level implementation guidance

List files to create/change and the responsibility of each.

## Allowed edit zones

-

## Files/areas not to change

-

## Testing plan

Include unit, integration, Playwright, CI, and production-operator checks as
required. Backend-dependent browser criteria should use
`pnpm test:e2e:authenticated`, not production credentials.

## Acceptance criteria

- [ ]

## Rollback

Describe how to safely revert code, data, or workflow changes.
