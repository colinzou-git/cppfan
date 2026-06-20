# AI Chat

cppFan provides authenticated, context-aware AI tutoring beside learning items, quizzes, FSRS reviews, write-code exercises, labs, capstone milestones, and interview questions.

## Configuration

Copy `.env.example` to `.env.local` and configure:

```text
AI_CHAT_ENABLED=true
AI_PROVIDER=groq
AI_MODEL=openai/gpt-oss-120b
GROQ_API_KEY=<your Groq API key>
```

`GROQ_API_KEY` is read only by the App Router server endpoint. It must never be prefixed with `NEXT_PUBLIC_` or imported by a client component. The model and provider remain configurable so the first provider can be replaced without changing item integrations.

For deterministic local or CI checks that must not make an external request:

```text
AI_CHAT_ENABLED=true
AI_PROVIDER=fake
```

Optional bounded-usage settings are documented in `.env.example`.

## Data and privacy

AI Chat requires an authenticated Supabase session. Conversations and messages are stored under the authenticated learner ID and stable item identity. Row-level security limits reads, writes, updates, and deletion to the owner.

The context envelope contains an explicit allowlist of learner-visible fields. It excludes answer-key flags, hidden judge tests, hidden solutions, grading credentials, other learners' records, and unrelated profile data. Chat records are advisory and remain separate from attempts, FSRS scheduling, mastery, goals, lab completion evidence, judge results, and interview-readiness evidence.

History can be deleted one conversation at a time or all at once for the current item.

## Assessment behavior

Before deterministic grading, quiz and review contexts use a hint-only policy. Timed interview sessions use an interviewer policy that asks guiding questions and does not provide a complete answer or final code. These restrictions are enforced in server-owned system instructions rather than trusted to the browser.

AI output may be incorrect. The UI states that cppFan grading and evidence remain authoritative.

## Dictation

The composer uses the browser or device speech-recognition capability when available. Listening starts only after the learner activates **Start dictation**. Final transcript text is inserted at the current selection, remains editable, and is never submitted automatically.

No audio recording is stored by cppFan. Browser/platform speech recognition may be processed according to the browser or operating-system provider's privacy terms. Unsupported, denied, interrupted, or error states leave typing fully available.

Manual verification matrix:

| Platform | Expected check |
| --- | --- |
| Chrome or Edge desktop | Permission prompt, start/stop state, editable transcript, cleanup on navigation |
| iPhone/iPad Safari | Capability fallback or platform recognition, on-screen keyboard safety, editable transcript |
| Unsupported browser | Clear fallback message and fully usable typing |

## Failure behavior

The server returns structured errors for authentication, invalid context, app quotas, provider quotas, timeouts, unsupported configuration, and provider failures. Streaming can be stopped by the learner. Completed requests are idempotent by request ID, and partial stopped/failed assistant output is saved with its status.

## Validation

```bash
pnpm verify
pnpm test:integration
pnpm test:e2e
```

Normal automated tests use the fake provider and do not require `GROQ_API_KEY` or consume Groq quota. Database migration CI applies the AI Chat schema and RLS policies to a fresh Postgres instance.
