# Source-code rules

Scope: everything under `src/`.

- Start from the relevant feature directory under `src/features/`; do not scan or rewrite unrelated features.
- Preserve Next.js App Router server/client boundaries. Add `"use client"` only when browser state, effects, or event handlers require it.
- Prefer existing `@/` imports and existing shared utilities over new abstractions.
- Keep domain logic outside React components when it can be expressed as a pure function or service.
- Preserve responsive behavior for iPhone, iPad, and desktop layouts.
- Do not touch auth, app-wide routing, database contracts, analytics, or error tracking unless the issue explicitly includes them.
- Add or update focused unit tests for behavioral changes; use E2E tests only for user-visible workflows.
- Before opening broad files, query the code index with `pnpm ai:query -- <symbol-or-module>`.
