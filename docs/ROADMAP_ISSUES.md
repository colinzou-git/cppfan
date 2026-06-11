# cppFan Roadmap Issues

This file contains the planned GitHub issue backlog for cppFan. These can later be copied into GitHub issues or created through GitHub CLI.

## 001 Bootstrap AI development foundation

Labels: `type:docs`, `area:ai-dev`, `area:foundation`, `priority:p0`

Problem: cppFan needs a development foundation before app features are implemented, so Claude Code can work safely with specs, guardrails, issue templates, CI, and documentation.

Scope:

- Add `CLAUDE.md`.
- Add project brief.
- Add development plan.
- Add architecture overview.
- Add AI guardrails.
- Add event schema.
- Add skill engine design.
- Add ADRs for stack choices.
- Add pull request template.
- Add feature issue template.
- Add placeholder CI when possible.

Non-goals:

- Do not implement the Next.js app yet.
- Do not add Supabase code yet.
- Do not add FSRS code yet.
- Do not add UI features yet.

Allowed edit zones:

- `CLAUDE.md`
- `README.md`
- `docs/**`
- `specs/**`
- `.github/**`

Acceptance criteria:

- Repo has a clear AI-assisted development workflow.
- Repo has specs and docs for the planned architecture.
- Future Claude Code tasks can follow allowed edit zones.

## 002 Scaffold Next.js + Supabase app

Labels: `type:infra`, `area:frontend`, `area:auth`, `area:foundation`, `priority:p0`

Problem: cppFan needs a real web app scaffold using the selected modern stack.

Scope:

- Add Next.js App Router project.
- Add TypeScript.
- Add pnpm.
- Add Tailwind CSS.
- Add shadcn/ui/Radix-compatible setup.
- Add Supabase client/server auth setup placeholders.
- Add landing page.
- Add protected dashboard placeholder.
- Add `.env.example`.
- Add scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`.
- Add Vitest and Playwright smoke test setup.
- Update CI to install, lint, typecheck, build, and test.

Non-goals:

- Do not implement learning features.
- Do not implement billing.
- Do not implement teams/admin.
- Do not add unnecessary SaaS starter features.

## 003 Configure Supabase Auth with Google and email login

Labels: `type:feature`, `area:auth`, `area:database`, `priority:p0`

Problem: Users need accounts so cppFan can sync progress across Windows PC, iPad, and iPhone.

Scope:

- Configure Supabase Auth client/server usage.
- Add Google login UI.
- Add email login UI if supported by the selected auth flow.
- Add logout.
- Add auth callback route.
- Add protected dashboard route.
- Add user session loading state.
- Document Supabase setup steps.

## 004 Add user profile and onboarding

Labels: `type:feature`, `area:auth`, `area:database`, `area:frontend`, `priority:p0`

Problem: cppFan needs basic user profile and onboarding information to personalize learning.

Scope:

- Add profile table migration.
- Add RLS policies.
- Add profile creation after first login.
- Add onboarding page.
- Capture current C++ level, daily goal, preferred practice mode, and target platforms.
- Show profile summary on dashboard.

## 005 Add skill map data model

Labels: `type:feature`, `area:database`, `area:learning-engine`, `priority:p0`

Problem: cppFan needs a structured skill map for C++, data structures, and algorithms.

Scope:

- Add skills table.
- Add prerequisite/relationship model.
- Add initial seed data.
- Add skill map query helpers.
- Add simple skill map UI.

## 006 Add learning item and quiz model

Labels: `type:feature`, `area:database`, `area:learning-engine`, `area:content`, `priority:p1`

Problem: cppFan needs learning items linked to skills, including lessons, quizzes, and practice prompts.

Scope:

- Add learning items model.
- Add quiz model.
- Link items to skills.
- Add initial sample content for structs/classes.
- Add lesson page.
- Add quiz interaction component.

## 007 Add FSRS review card and review log model

Labels: `type:feature`, `area:database`, `area:learning-engine`, `priority:p0`

Problem: cppFan needs database tables to store FSRS scheduling state and review history.

Scope:

- Add review cards table.
- Add review logs table.
- Store FSRS state fields.
- Link review cards to user, skill, and learning item.
- Add RLS policies.
- Add database helper functions/types.

## 008 Implement ts-fsrs review queue

Labels: `type:feature`, `area:learning-engine`, `area:frontend`, `priority:p0`

Problem: Users need a review queue that schedules learning items using FSRS.

Scope:

- Add `ts-fsrs` dependency.
- Implement review due query.
- Implement review rating flow.
- Update review card after answer.
- Insert review log.
- Add review queue UI.
- Add dashboard due-review summary.

## 009 Add skill event ledger

Labels: `type:feature`, `area:database`, `area:learning-engine`, `priority:p0`

Problem: cppFan needs an append-only learning event ledger to track learning behavior beyond review scheduling.

Scope:

- Add skill events table.
- Add event insert API/helper.
- Add initial event names from `docs/EVENT_SCHEMA.md`.
- Log events from lesson, quiz, hint, and review flows.
- Add event validation.

## 010 Add mastery scoring and weak-skill detection

Labels: `type:feature`, `area:learning-engine`, `area:frontend`, `priority:p1`

Problem: Users need to know which skills are mastered, weak, or need more attention.

Scope:

- Add mastery calculation helper.
- Use recent skill events and review logs.
- Define mastery statuses.
- Add mastery snapshot table if needed.
- Show weak skills and mastered skills on dashboard.
- Update skill map visual state.

## 011 Add C++ structs/classes learning module

Labels: `type:feature`, `area:content`, `area:learning-engine`, `area:frontend`, `priority:p1`

Problem: cppFan needs its first real C++ learning module to validate the content and practice model.

Scope:

- Add learning content for structs/classes.
- Cover syntax, public/private, member variables, member functions, object creation, references, const correctness basics, and common mistakes.
- Add quizzes.
- Add code-reading tasks.
- Add bug-spotting tasks.
- Link content to relevant skills.
- Log skill events.

## 012 Add constructors, RAII, and smart pointers module

Labels: `type:feature`, `area:content`, `area:learning-engine`, `area:frontend`, `priority:p1`

Problem: cppFan needs a deeper C++ module covering constructors, RAII, and smart pointers.

Scope:

- Add learning content for constructors.
- Add learning content for RAII.
- Add learning content for `unique_ptr`, `shared_ptr`, and `weak_ptr`.
- Include ownership diagrams or simple visual explanations.
- Add quizzes and bug-spotting tasks.
- Link to skills and review items.
- Log skill events.

## 013 Add Playwright smoke tests for core workflows

Labels: `type:infra`, `area:testing`, `priority:p0`

Problem: cppFan needs browser workflow tests so Claude Code can use failing traces and screenshots as feedback.

Scope:

- Add or improve Playwright config.
- Add smoke tests for landing page, dashboard protection, onboarding, skill map, quiz, and review queue.
- Enable traces/screenshots/videos on failure.
- Add mobile viewport tests for iPhone and iPad sizes.
- Update CI to run E2E tests where practical.

## 014 Add Repomix/repo-map AI context generation

Labels: `type:infra`, `area:ai-dev`, `priority:p1`

Problem: Claude Code needs compact repo context so it does not scan or modify unrelated files.

Scope:

- Add Repomix config.
- Add AI context script.
- Add generated or ignored `.ai` outputs as appropriate.
- Add repo map process.
- Document how Claude should use repo maps.
- Add current feature context template.

## 015 Add Claude Code guardrail hooks

Labels: `type:infra`, `area:ai-dev`, `area:testing`, `priority:p1`

Problem: Claude Code needs enforceable guardrails to avoid unrelated edits and unsafe changes.

Scope:

- Add Claude Code hook examples or scripts.
- Add allowed-edit-zones check.
- Add dependency-change guard.
- Add migration-change guard.
- Add post-edit test command suggestions.
- Document how to enable hooks locally.
- Keep hooks safe and understandable.
