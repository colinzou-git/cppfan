# Claude Code Instructions for cppFan

cppFan is a cross-device web app for learning C++, data structures, and algorithms through efficient practice, review scheduling, and skill mastery tracking.

The app should be optimized for Windows PC, iPad, and iPhone. The long-term workflow should support GitHub-only development so the project can be continued from an iPhone through Claude Code, GitHub issues, pull requests, and CI feedback.

## Product direction

Build cppFan as a custom adaptive learning app, not a generic LMS.

Core ideas:

- Use structured skill maps for C++, data structures, and algorithms.
- Use FSRS for review scheduling.
- Use a separate skill mastery model based on learning events, quiz results, review results, hint usage, and coding/practice attempts.
- Keep the learning loop fast, mobile-friendly, and motivating.
- Prefer small, reviewable changes over large rewrites.

## Stack

Implemented stack (in use today):

- Framework: Next.js App Router with TypeScript
- Backend/auth/sync: Supabase Auth, Supabase Postgres, RLS, and Storage
- UI: Tailwind CSS, shadcn/ui, and Radix UI
- Server state: TanStack Query
- Local UI state: Zustand
- Workflow/state machines: XState where useful
- Review scheduling: ts-fsrs
- Product analytics: PostHog
- Error tracking: Sentry
- Tests: Vitest, Vitest Browser Mode, Playwright, Storybook/visual testing later
- CI/CD: GitHub Actions and Vercel preview deployment later
- AI context: Repomix and generated repo/symbol maps

## Required workflow for Claude Code

Before editing code or docs:

1. Read this file.
2. Read the relevant spec under `specs/`.
3. Read relevant architecture/design docs under `docs/`.
4. Inspect the current repository state.
5. Summarize the intended change.
6. List allowed edit zones.
7. List files that should not be touched.

During implementation:

- Make the smallest useful change that satisfies the issue/spec.
- Do not rewrite unrelated code.
- Do not remove existing UI behavior unless the task explicitly asks for it.
- Preserve iPhone, iPad, and Windows PWA compatibility.
- Keep implementation modular and testable.
- Update docs when behavior or architecture changes.
- Add or update tests for behavior changes.

After implementation:

- Summarize changed files and why each was changed.
- Run the relevant validation commands.
- Report exact command results.
- Explain known limitations or follow-up work.

Run these unless the task explains why not:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

For UI or workflow changes, also run:

```bash
pnpm test:e2e
```

## Guardrails

Do not change these areas unless the current issue/spec explicitly allows it:

- Authentication code
- Database migrations
- RLS policies
- Package dependencies
- CI/CD workflows
- App-wide routing/layout
- Generated data or generated AI context files

Before touching any of those areas, state why the task requires it.

## Dependency rules

- Do not add dependencies casually.
- Prefer built-in platform features and existing libraries already in the project.
- If a new dependency is needed, explain why, alternatives considered, and where it will be isolated.
- Pin critical learning-science dependencies where stability matters.

## Database rules

- Treat migrations as high-risk changes.
- Every migration must include a clear purpose.
- RLS must be considered for every user-owned table.
- User learning data must never be readable by another user.
- Do not change schema in a feature PR unless that PR explicitly includes schema changes.

## AI coding loop

The intended development loop is:

```text
issue/spec -> plan -> allowed edit zones -> implementation -> tests -> CI feedback -> fix -> PR -> merge
```

Use GitHub issues and pull requests as the source of truth. Each feature should include acceptance criteria and test expectations.

## Issue and PR closure discipline

Closing an issue is a claim that its **entire** original scope is done — treat it
that way. Premature closure of parent/roadmap/completion issues after a single
slice is a recurring defect (see #132/#147); these rules prevent it.

- Never close a parent, roadmap, completion ("Complete … from #N"), or
  multi-slice issue unless **every** original requirement and acceptance
  criterion has been verified against current `main`. "Foundation landed",
  "first slice", "functionally done", and "model complete" never mean the
  original issue is complete.
- For partial work, reference the issue with `Part of #N` (or a plain mention).
  Never use `Closes`, `Fixes`, `Resolves`, or any issue-closing keyword/command
  for a PR that implements only one slice.
- After a PR merges, re-read the issue body, its checklist, and its comments
  before taking any close action — do not close from memory.
- Before closing, post a **final closure-evidence audit** comment that maps every
  acceptance criterion to the code, test, doc, or an explicitly justified
  removal that satisfies it. Use the heading `## Final closure audit`.
- A focused, genuinely single-PR bug/chore issue may close normally via an
  explicit complete declaration once its one fix and test land.
- The closure guard (`scripts/ci/closure-guard.mjs` + `.github/workflows/closure-guard.yml`)
  enforces this: a completion-tracked issue closed with unchecked boxes, a
  "still open"/"not closing" comment, a linked partial PR, or no final audit is
  automatically reopened with the reasons.

## Quality bar

A change is ready only when:

- It matches the spec.
- It avoids unrelated files.
- It includes relevant tests or explains why tests are not applicable.
- It keeps the app mobile-friendly.
- It preserves user data and learning progress.
- It has a clear rollback path.
