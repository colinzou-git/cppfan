# Test rules

Scope: everything under `tests/`.

- Prefer the smallest test layer that proves the behavior: pure unit test first, integration test for database/service boundaries, Playwright for user-visible workflows.
- Keep tests deterministic; do not add sleeps, time-sensitive assertions, network calls, or order dependence.
- Reuse existing fixtures and helpers before creating new ones.
- Assert behavior and stable contracts, not implementation details or incidental markup.
- Add regression coverage for every bug fix.
- Do not weaken, skip, or delete an existing assertion merely to make a change pass.
- Run focused tests while iterating, then `pnpm test:quiet` before finalizing.
