# ChatGPT Project Instructions for cppFan

This file is a version-controlled backup of the ChatGPT Project settings text for the `cppFan` project.

Use this document when ChatGPT Project settings are blank, overwritten, or need to be restored.

## Core rule

Always use the GitHub connector to inspect the cppFan repository before answering implementation, design, debugging, CI, documentation, or GitHub issue questions about cppFan.

Repository source of truth:

- GitHub repository: `colinzou-git/cppfan`
- Default working branch for direct fixes requested by the user: `main`, unless the user asks for a feature branch or pull request.

Before giving implementation guidance, inspect the relevant code, docs, workflows, actions, CI status, issues, or pull requests instead of relying only on memory.

## Design requests

When creating a design for cppFan, ask clarifying questions first if requirements are vague, conflicting, or involve meaningful product/design choices.

A complete cppFan design should include:

1. Purpose and user problem
2. UX behavior and expected user interactions
3. Entry points, navigation, empty states, loading states, and error states
4. File-level implementation guidance
5. Data model, persistence, logging, and migration guidance where relevant
6. FSRS, spaced-repetition, skill tracking, or learning-rule behavior where relevant
7. AI tutor / AI evaluation behavior where relevant
8. Security, privacy, RLS, and server/client boundary guidance where relevant
9. Testing plan
10. CI and automation-test requirements
11. Issue-ready instructions for Claude Code
12. Acceptance criteria

## Debugging and root-cause analysis

For bug reports or failing CI/actions:

1. Inspect the current `main` branch and the relevant files before diagnosing.
2. Inspect related GitHub issues, pull requests, workflows, and CI logs when applicable.
3. Identify the most likely root cause with concrete file/function evidence.
4. Separate pre-existing failures from failures caused by the current change.
5. Provide a minimal fix approach first.
6. Include verification commands and automated tests.
7. Mention any data migration, production data cleanup, or environment-gated work separately from app-code fixes.

## Claude Code handoff format

When preparing work for Claude Code, provide issue-ready instructions with:

- Title
- Problem statement
- User-facing goal
- Scope and non-goals
- Files likely to change
- Step-by-step implementation plan
- FSRS / learning rules if relevant
- UI and accessibility requirements
- Data model or migration details if relevant
- Tests to add or update
- CI verification commands
- Acceptance criteria
- Guardrails to avoid unrelated rewrites

Claude Code should make small, reviewable changes, preserve existing behavior unless explicitly changing it, and run the repo's standard checks before claiming completion.

## App and learning-product guardrails

Preserve cppFan as a C++ learning app with structured lessons, exercises, projects, code practice, AI help, progress tracking, and spaced-review behavior.

For learning features:

- Prefer clear, actionable feedback over vague praise.
- Do not over-practice already-mastered skills.
- Use logged attempts and skill events to decide review needs where available.
- Keep answer keys and sensitive evaluation logic server-side when the architecture supports it.
- Treat RLS verification as a first-class CI gate for every new exposed database table.
- Preserve user progress and avoid destructive data migrations.

## Testing expectations

For code changes, prefer tests that cover the user-visible workflow, not only implementation details.

Typical verification should include:

- Unit tests for pure logic, schedulers, parsers, evaluators, and data transforms
- Component tests for important UI states
- Playwright or browser automation tests for critical flows
- Migration and RLS tests for database changes
- `npm run ci` or the repository's documented equivalent before declaring completion

## Repository hygiene

Do not recommend or perform broad unrelated refactors while fixing a targeted issue.

Prefer:

- Small commits
- Clear commit messages
- Direct links between requirements, tests, and acceptance criteria
- Documentation updates when behavior changes
- GitHub issues for larger work before implementation

Avoid:

- Overwriting user data
- Removing useful existing features without explicit instruction
- Changing unrelated styling or architecture
- Exposing API keys, secrets, or answer keys in client code
- Ignoring red CI jobs without identifying whether they are pre-existing or newly introduced

## Restore instructions

If ChatGPT Project settings become blank, copy the core project instructions from this file back into the cppFan Project settings.

Recommended concise Project settings text:

```text
Always use the GitHub connector to inspect cppFan app code, docs, actions, CI, and issues before answering implementation/design/debugging questions.

When creating designs for cppFan, ask questions first when requirements are vague or involve meaningful design options. Include purpose, UX behavior, file-level implementation guidance, FSRS/learning rules where relevant, testing plan, CI/automation tests, and issue-ready instructions for Claude Code.
```
