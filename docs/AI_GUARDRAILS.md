# AI Guardrails for cppFan

This document defines how Claude Code and other AI coding agents should work in cppFan without damaging unrelated code, user data, or architecture.

## Main rule

Every feature starts from a GitHub issue or spec. Claude Code should not make broad changes based only on a vague request.

Required sequence:

```text
read CLAUDE.md -> read issue/spec -> inspect repo -> list allowed edit zones -> implement -> test -> summarize -> PR
```

## Allowed edit zones

Every task must define which files or folders can be edited.

Example:

```text
Allowed edit zones:
- src/features/review/**
- src/lib/fsrs/**
- tests/review/**
- docs/SKILL_ENGINE.md

Denied unless explicitly approved:
- src/features/auth/**
- supabase/migrations/**
- package.json
- .github/workflows/**
```

Claude Code must state the allowed edit zones before editing.

## High-risk areas

These areas require explicit permission from the current issue/spec:

- Authentication
- Database migrations
- RLS policies
- Dependencies
- CI/CD workflows
- App-wide layout/routing
- Generated files
- Deployment configuration
- Environment variables

## Branch and PR workflow

Recommended flow:

```text
main -> feature branch -> focused commits -> tests -> PR -> review -> merge
```

Branch names should be descriptive:

```text
bootstrap/ai-dev-foundation
scaffold/nextbase-supabase-app
feature/auth-google-email
feature/fsrs-review-queue
feature/skill-event-ledger
```

Every PR should include:

- Linked issue
- Summary
- Changed files
- Tests run
- Screenshots or Playwright traces for UI changes
- Known limitations
- Rollback plan

## Preventing unrelated changes

Claude Code should:

- Avoid formatting unrelated files.
- Avoid renaming files unless required.
- Avoid moving modules unless the spec says so.
- Avoid deleting existing UI/features unless explicitly requested.
- Avoid changing dependencies unless required and explained.
- Avoid changing schema unless required and explained.

If Claude discovers unrelated bugs, it should document them as follow-up issues instead of fixing them in the current PR.

## Test expectations

When the app scaffold exists:

- Pure logic changes require unit tests.
- UI behavior changes require component or Playwright tests.
- Database changes require RLS and data-access tests where practical.
- Workflow changes require Playwright smoke tests.

Minimum commands for most code PRs:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

For UI/workflow PRs:

```bash
pnpm test:e2e
```

## Handling failing tests

If tests fail, Claude Code should:

1. Copy the exact failing command and error summary.
2. Identify whether the failure is related to the current change.
3. Fix related failures.
4. Avoid fixing unrelated failures unless the issue explicitly allows it.
5. Re-run the smallest relevant test first.
6. Re-run the full required validation after the fix.

## Dependency guard

Before adding a package, Claude must explain:

- Why it is needed
- Why existing tools are not enough
- Whether it affects bundle size
- Whether it is actively maintained
- Where it will be isolated

Dependencies should not be added in content-only or docs-only PRs.

## Database guard

Before adding or changing a migration, Claude must explain:

- Which user problem requires schema change
- Which tables are affected
- Whether data is user-owned or shared
- Which RLS policies are needed
- How rollback would work

## AI context files

Later, generated AI context files may live under `.ai/`.

Recommended files:

```text
.ai/repo-map.md
.ai/repomix-output.xml
.ai/current-feature-context.md
.ai/allowed-edit-zones.json
```

Do not commit huge generated files unless the project intentionally chooses to do so.

## Human review checkpoints

Human review is required for:

- Auth changes
- RLS policies
- Database migrations
- Dependency changes
- CI/CD permissions
- Production deployment settings
- Any code execution sandbox
- Any analytics change that affects user privacy

## Good Claude Code behavior

A good Claude Code response should include:

```text
Repo state checked:
Relevant specs read:
Allowed edit zones:
Files changed:
Tests run:
Result:
Known limitations:
Next recommended step:
```

## Bad Claude Code behavior

Avoid:

- "I fixed several things while I was there."
- Large unrequested rewrites.
- Changing many unrelated files.
- Adding dependencies without explanation.
- Skipping tests without explanation.
- Editing generated/build files.
- Touching auth/database/CI in unrelated feature work.
