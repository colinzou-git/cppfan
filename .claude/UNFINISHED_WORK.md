# Unfinished Work and Issue Closure

This file is a durable companion to `CLAUDE.md` for partial or multi-slice
work. It exists because parent, roadmap, and completion issues have previously
been closed after only a first slice.

## Rules

- Treat closing an issue as a claim that the entire original issue is complete.
- For parent, roadmap, completion, or multi-slice issues, do not close until
  every original requirement and acceptance criterion is verified on current
  `main`.
- For partial work, use `Part of #N` or a plain mention. Do not use `Closes`,
  `Fixes`, `Resolves`, or GitHub issue-closing commands.
- After a PR merges, re-read the issue body, checklist, and latest comments
  before taking any closure action.
- Before closing tracked work, post a `## Final closure audit` comment mapping
  each acceptance criterion to concrete code, tests, docs, or an explicitly
  justified removal.
- Older comments saying work remains may be superseded only by a later complete
  final closure audit. Newer remaining-work comments still block closure.

## Current Closure Automation

The guard lives in:

- `scripts/ci/closure-guard.mjs`
- `scripts/ci/closure-guard-action.mjs`
- `.github/workflows/closure-guard.yml`

It checks pull requests that reference tracked issues and reopens
completion-tracked issues that close without the required evidence.
