# Issue #473 exercise catalog review and implementation seed

Branch: `issue-473-exercise-seed`

This branch is a Claude Code handoff seed for expanding the `/exercises` catalog. It does not render the backlog directly in the app yet. Claude should convert the typed backlog into canonical exercise packages, catalog entries, and Code Lab configs.

## Review findings

1. **Do not add catalog-only exercises.** `tests/unit/exercise-catalog.test.ts` requires exact parity between `exerciseCatalog` and `exercises/<id>/exercise.json` packages.
2. **Do not add package-only exercises.** The same test requires every package directory to exist in `exercise-catalog.ts`.
3. **Required test names must match.** Every `required_tests` item in `exercise.json` must appear as text in `tests/tests.cpp`.
4. **Skill IDs must already exist.** The current unit tests validate `skill_ids` against `skillSeed`.
5. **Code Lab configs are client-readable.** Visible tests can be in `exercise-code-lab-configs.ts`; hidden test I/O must not be there.
6. **Project-lab IDs are under-validated today.** Existing `tooling-status-parser` references `debugging-toolchain-lab`, but `src/features/labs/project-labs.ts` does not currently define that lab. Before converting backlog specs, either add this project lab or remap references to an existing lab.

## Online-resource alignment used for refinement

- HackerRank's C++ domain starts with Hello World, input/output, data types, conditionals, loops, functions, pointers, arrays, strings, classes, STL, inheritance, debugging, and other concepts.
- LeetCode's Top Interview 150 describes itself as a must-do interview-prep list that covers comprehensive interview topics.
- LearnCpp emphasizes writing, compiling, debugging, functions/files, data types, strings, control flow, random, testing, invalid input, and assertions.
- cppreference's standard library pages emphasize containers and algorithms/ranges as central C++ practice areas.
- The C++ Core Guidelines reinforce resource safety, RAII, ownership, and concurrency/data-race safety.

## Refined implementation order

### First PR from this branch

Implement the first 3 to 5 Phase 1 exercises end-to-end:

1. `io-grade-calculator`
2. `loops-number-summary`
3. `functions-temperature-converter`
4. `getline-contact-parser`
5. `references-swap-clamp`

For each one, add:

- `exercises/<id>/README.md`
- `exercises/<id>/exercise.json`
- `exercises/<id>/starter/<editable-file>`
- `exercises/<id>/solution/<editable-file>`
- `exercises/<id>/tests/tests.cpp`
- `src/features/exercises/exercise-catalog.ts` entry
- `src/features/code-lab/exercise-code-lab-configs.ts` entry
- `docs/WRITE_CODE_EXERCISES.md` row

### Validation commands

```bash
pnpm lint
pnpm typecheck
pnpm test
scripts/exercises/verify-all.sh
pnpm build
```

## Important implementation constraints

- Keep each exercise under 60 minutes; split larger ones.
- Use only existing `skillSeed` IDs.
- Use an existing `projectLabs` ID unless adding a real new project lab.
- Put the intended group/topic skill first in `skillIds`.
- Prefer deterministic stdin/stdout Code Lab tasks.
- Do not expose hidden test inputs or expected outputs in client-readable config.
- Use original cppFan wording and tests; do not copy outside problem statements.
