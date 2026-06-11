# cppFan Architecture

## Overview

cppFan should be a custom adaptive learning web app for C++, data structures, and algorithms. The architecture separates the app into these major layers:

```text
User interface
  -> learning workflows
  -> review engine
  -> skill mastery engine
  -> event ledger
  -> Supabase database/auth/storage
```

The most important architecture decision is to separate:

- Review scheduling: when a user should review an item
- Skill mastery: how well the user understands a skill
- Event logging: what actually happened during learning

## Planned stack

| Area | Technology |
|---|---|
| Web framework | Next.js App Router |
| Language | TypeScript |
| Package manager | pnpm |
| Styling | Tailwind CSS |
| UI components | shadcn/ui + Radix UI |
| Auth | Supabase Auth |
| Database | Supabase Postgres |
| Security | Supabase RLS |
| Storage | Supabase Storage |
| Server state | TanStack Query |
| Local UI state | Zustand |
| Workflow state | XState where useful |
| Review scheduling | ts-fsrs |
| Analytics | PostHog |
| Error tracking | Sentry |
| Unit tests | Vitest |
| Browser workflow tests | Playwright |
| CI | GitHub Actions |
| Deployment | Vercel later |
| AI context | Repomix and repo maps |

## Frontend modules

Proposed module layout after app scaffold:

```text
src/
  app/ or app/
  components/
  features/
    auth/
    profile/
    onboarding/
    skills/
    learning-items/
    quiz/
    review/
    events/
    mastery/
    dashboard/
  lib/
    supabase/
    fsrs/
    analytics/
    errors/
  test/
```

Each feature should own its UI, hooks, helpers, tests, and local types where practical.

## Backend tables

Initial database model:

| Table | Purpose |
|---|---|
| `profiles` | User profile and onboarding preferences |
| `skills` | Skill hierarchy and metadata |
| `skill_prerequisites` | Prerequisite edges between skills |
| `learning_items` | Lessons, quizzes, practice prompts, reviewable units |
| `quiz_questions` | Quiz data if not stored inside learning item JSON |
| `review_cards` | FSRS scheduling state per user/item |
| `review_logs` | History of reviews and ratings |
| `skill_events` | Append-only learning event ledger |
| `mastery_snapshots` | Optional derived mastery state over time |
| `study_sessions` | Optional study-session summary |

## Data ownership

User-owned data must be protected by RLS:

- profiles
- review cards
- review logs
- skill events
- mastery snapshots
- study sessions

Shared curriculum data can be public read-only:

- skills
- skill prerequisites
- learning items
- quiz questions

## Learning event flow

Example quiz flow:

```text
User opens lesson
  -> insert lesson_started event
User sees concept
  -> insert concept_seen event
User answers quiz
  -> insert quiz_attempted event
If correct
  -> insert quiz_correct event
If wrong
  -> insert quiz_wrong event
If hint used
  -> insert hint_used event
Update related review card if applicable
Update derived mastery status if applicable
```

Example review flow:

```text
Load due review cards
  -> show review item
User answers
  -> user rates result
  -> ts-fsrs calculates next schedule
  -> update review_cards
  -> insert review_logs
  -> insert review_completed event
  -> update mastery snapshot or derived status
```

## Review scheduling

FSRS should be isolated behind a wrapper module:

```text
src/lib/fsrs/
  scheduler.ts
  types.ts
  mapping.ts
```

Benefits:

- Keeps external scheduling library isolated.
- Makes future FSRS upgrades safer.
- Makes tests easier.
- Prevents feature code from depending on raw library internals.

## Skill mastery

Skill mastery is calculated from events and review logs. It should not be treated as identical to FSRS card state.

Potential inputs:

- Recent correctness
- Review stability
- Hint usage
- Repeated mistakes
- Practice task completion
- Time since last success
- Task difficulty
- Skill prerequisite completion

Potential statuses:

- `new`
- `learning`
- `reviewing`
- `weak`
- `strong`
- `mastered`
- `regressed`

## UI architecture

Pages should be simple and mobile-first:

- `/` landing page
- `/login` or `/auth` login page
- `/dashboard` protected dashboard
- `/onboarding` onboarding
- `/skills` skill map
- `/learn/[itemId]` learning item
- `/review` review queue
- `/settings` profile/preferences

Important responsive targets:

- iPhone portrait
- iPad portrait/landscape
- Windows desktop

## Testing strategy

| Test type | Purpose |
|---|---|
| Unit tests | Pure helpers: FSRS wrapper, quiz scoring, mastery scoring |
| Component/browser tests | UI states and interactions |
| Playwright tests | Full workflows in real browser |
| Mobile viewport tests | iPhone/iPad layout protection |
| CI checks | Prevent broken merges |

Core Playwright tests:

- Landing page smoke test
- Protected dashboard redirect
- Onboarding flow
- Skill map loads
- Lesson + quiz flow
- Review flow
- Mobile layout smoke test

## AI development workflow

Claude Code should not scan and modify the whole repository for each task. Instead, every task should have:

- Issue/spec
- Acceptance criteria
- Allowed edit zones
- Relevant docs
- Test expectations
- Rollback plan

AI context files should be generated later under `.ai/`:

```text
.ai/
  repo-map.md
  repomix-output.xml
  current-feature-context.md
  allowed-edit-zones.json
```

## Security and privacy

- User learning data must be private by default.
- RLS must be used for all user-owned tables.
- Secrets must never be committed.
- Analytics should not include sensitive content unless explicitly designed and documented.
- Logs should avoid exposing personal data.

## Scalability considerations

Early design should support:

- More learning modules
- More skills
- More event types
- More review cards
- Future code execution
- Future algorithm visualizations
- Future adaptive recommendations

Do not overbuild before the first learning loop is validated.
