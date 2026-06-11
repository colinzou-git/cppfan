# Spec 000: AI Development Foundation

## Status

Bootstrap spec.

## Problem

cppFan needs a safe project foundation before app features are implemented. The repository should guide Claude Code and other AI agents toward focused, testable, reviewable changes.

## Goals

- Add project-level AI instructions.
- Add product and architecture docs.
- Add AI guardrails.
- Add initial learning event and skill-engine design.
- Add issue and PR templates.
- Add placeholder CI that does not fail before the app exists.
- Add architecture decision records.

## Non-goals

- Do not implement the Next.js app yet.
- Do not add Supabase code yet.
- Do not add FSRS code yet.
- Do not add UI components yet.
- Do not add dependencies yet.

## Allowed edit zones

- `CLAUDE.md`
- `README.md`
- `docs/**`
- `specs/**`
- `.github/**`

## Acceptance criteria

- The repo contains clear instructions for Claude Code.
- The repo contains a project brief.
- The repo contains an architecture overview.
- The repo contains a development plan.
- The repo contains AI guardrails.
- The repo contains event schema and skill-engine docs.
- The repo contains ADRs for major early architecture decisions.
- The repo contains GitHub PR and feature issue templates.
- The repo contains a placeholder CI workflow that passes before the app scaffold exists.

## Validation

- Manual review of docs.
- GitHub workflow syntax should be valid.
- No app code is required in this phase.

## Rollback plan

Revert the bootstrap documentation/template commits.
