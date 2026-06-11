# cppFan Development Plan

This plan turns cppFan from an empty repository into an AI-assisted, test-driven adaptive learning app.

## Phase 0: AI/dev foundation

Goal: make the repository safe for Claude Code and GitHub-only development.

Deliverables:

- `CLAUDE.md`
- Project brief
- Architecture overview
- AI guardrails
- Event schema
- Skill engine design
- ADRs
- Specs folder
- Pull request template
- Feature issue template
- Placeholder CI

Acceptance criteria:

- Claude Code has clear project rules.
- Future work is organized around specs and allowed edit zones.
- CI does not fail before the app scaffold exists.

## Phase 1: app scaffold

Goal: create the real web app foundation.

Target stack:

- Next.js App Router
- TypeScript
- pnpm
- Tailwind CSS
- shadcn/ui and Radix-compatible component setup
- Supabase client/server placeholders
- Vitest
- Playwright
- GitHub Actions CI

Deliverables:

- Landing page
- Protected dashboard placeholder
- `.env.example`
- Basic scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`
- Playwright landing page smoke test

Non-goals:

- No learning features yet
- No billing
- No teams/admin

## Phase 2: auth/profile/cloud sync

Goal: user accounts and cross-device progress foundation.

Deliverables:

- Supabase Auth integration
- Google login
- Email login if practical
- Logout
- Auth callback route
- Protected dashboard
- Profile table
- Onboarding flow
- RLS policies

Profile fields:

- Display name
- Current C++ level
- Daily study goal
- Preferred practice mode
- Target platforms

## Phase 3: skill map and learning content model

Goal: define what users are learning.

Deliverables:

- `skills` table
- Skill prerequisite model
- Initial seed data
- Skill map UI
- `learning_items` table
- Quiz/content model
- First sample module for structs/classes

Initial skill areas:

- C++ basics
- Structs/classes
- Constructors
- RAII
- Smart pointers
- Arrays
- Linked lists
- Stacks
- Queues
- Trees
- Graphs
- Sorting
- Searching
- Dynamic programming

## Phase 4: FSRS review engine

Goal: schedule reviews using learning-science-based spacing.

Deliverables:

- `ts-fsrs` integration
- `review_cards` table
- `review_logs` table
- Due review query
- Review queue UI
- FSRS rating flow
- Dashboard due count

Important principle:

FSRS decides when a card should be reviewed. FSRS does not by itself decide whether a skill is mastered.

## Phase 5: event logging and skill mastery

Goal: track learning behavior and convert it into skill status.

Deliverables:

- `skill_events` table
- Event validation
- Event logging from lessons, quizzes, hints, reviews, and practice tasks
- Mastery scoring helper
- Weak-skill detection
- Dashboard skill status
- Skill map visual status

Mastery should consider:

- Correctness
- Recency
- Repeated success
- Hint usage
- Wrong answers
- Review stability
- Practice task difficulty

## Phase 6: practice workflows

Goal: build useful C++/DSA practice beyond flashcards.

Deliverables:

- Code-reading tasks
- Predict-output tasks
- Bug-spotting tasks
- Fill-in-the-blank tasks
- Concept explanation tasks
- DSA walkthrough tasks

Later possibilities:

- Browser-based algorithm visualizations
- C++ compiled examples through WebAssembly
- Sandboxed code execution through Judge0 or Piston

## Phase 7: tests/analytics/observability

Goal: make the app reliable and observable.

Deliverables:

- Vitest unit tests
- Browser component tests where useful
- Playwright workflow tests
- Mobile viewport tests for iPhone and iPad
- Sentry error tracking
- PostHog product analytics
- CI artifacts for traces/screenshots on failure

Core workflows to test:

- Landing page loads
- Login/logout
- Dashboard protection
- Onboarding
- Skill map display
- Lesson + quiz
- Review queue
- Event logging
- Mastery status update

## Phase 8: AI closed-loop development

Goal: let Claude Code use specs, tests, CI logs, browser traces, and repo maps to improve the app safely.

Deliverables:

- Repomix config
- AI context generation scripts
- Repo/symbol map
- Current feature context template
- Allowed edit zones file
- Claude Code hook examples
- Dependency/schema change guards

Development loop:

```text
Issue -> spec -> allowed edit zones -> branch -> implementation -> tests -> CI -> PR -> feedback -> fix -> merge
```

## Feature order

Recommended issue order:

1. Bootstrap AI development foundation
2. Scaffold Next.js + Supabase app
3. Configure Supabase Auth with Google and email login
4. Add user profile and onboarding
5. Add skill map data model
6. Add learning item and quiz model
7. Add FSRS review card and review log model
8. Implement ts-fsrs review queue
9. Add skill event ledger
10. Add mastery scoring and weak-skill detection
11. Add C++ structs/classes learning module
12. Add constructors, RAII, and smart pointers module
13. Add Playwright smoke tests for core workflows
14. Add Repomix/repo-map AI context generation
15. Add Claude Code guardrail hooks
