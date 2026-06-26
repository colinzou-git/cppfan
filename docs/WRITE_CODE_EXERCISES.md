# Write-Code Exercises

Status: implemented roadmap issue #81 / #128 workflow; in-app Code Lab is the
primary path as of #440. Quizzes, code reading, and Parsons puzzles scaffold
understanding, but proficiency needs writing, compiling, testing, and debugging
real code.

## Primary path: in-app Code Lab (#440)

On `/exercises`, each write-code exercise card has a **Code** button that opens
the built-in full-screen Code Lab at `/lab/<exerciseId>` (e.g.
`/lab/dsa-two-sum-sorted`). There the learner edits starter C++, runs the
program, runs visible/hidden tests on the keyless Piston runner, and gets AI
help — all in the browser, on phone/tablet/desktop. Passing the real
(non-simulated) tests records code-attempt evidence and auto-marks the exercise
completed (without duplicate skill-event spam); `Mark tests passed` remains as a
manual self-report. AI Chat / Chat history stay scoped to
`sourceKind: "write_code_exercise"` + the exercise id.

Exercise-level Code Lab configs live in
`src/features/code-lab/exercise-code-lab-configs.ts`, keyed by exercise id. They
are single-file stdin/stdout harnesses that preserve the spirit of the original
header-based packages; hidden test I/O (if any) stays server-side.

## Advanced path: local / Codespaces workflow

The original test-backed packages still exist for learners who prefer a real
toolchain (kept under the card's "Advanced local workflow"). These run in
**GitHub Codespaces** (or any machine with a C++20 compiler); that path does not
execute C++ on cppFan's web server.

## Package layout

```text
exercises/<exercise-id>/
  README.md          # the task, requirements, and commands
  exercise.json      # id, skills, difficulty, editable files, build/test commands
  starter/           # what the learner edits (TODO stubs)
  tests/tests.cpp    # the tests (do not edit)
  solution/          # reference solution (do not peek until done)
  work/              # generated working copy (git-ignored)
```

`exercise.json` links each exercise to skill IDs and a related `/labs` project,
and lists the editable files, build/test commands, required test names, and
hints. The solution and the tests' answer logic are kept out of the
learner-facing default path (`work/` only ever contains the starter).

## The Three Commands

All scripts write **only** inside the exercise's own `work/` directory and
refuse to touch anything else.

```bash
# 1. Prepare a working copy of the starter
scripts/exercises/prepare.sh <exercise-id>

# 2. Edit exercises/<exercise-id>/work/<file> ...

# 3. Build (warnings + address/UB sanitizers) and run the tests
scripts/exercises/test.sh <exercise-id>

# Start over from the starter at any time
scripts/exercises/reset.sh <exercise-id>
```

The build uses `g++ -std=c++20 -Wall -Wextra -Wpedantic
-fsanitize=address,undefined`. On a toolchain without AddressSanitizer, such as
some Windows/MinGW setups, prefix with `EX_SANITIZE=0`. Linux Codespaces have
ASan, so leave it on there.

## On iPhone / iPad

1. In cppFan, open an exercise and tap **Open instructions** to see the package
   path and commands.
2. Open the repo in a **Codespace** from the GitHub mobile app or Safari
   (`Code` -> `Codespaces` -> `Create`). Codespaces give you a real Linux
   terminal in the browser, so the three commands above work unchanged on a
   phone.
3. Run `prepare`, edit `work/<file>` in the Codespace editor, then run `test`.
4. When the tests pass, return to cppFan and mark the exercise complete.

## Completion Evidence

The workflow is explicit/manual: the learner marks **tests passed** and
optionally records a short reflection. cppFan records write-code skill evidence
with the stable ledger names `code_attempted` and `code_passed` for the
exercise's `skill_ids`. As with all practice, this contributes mastery
**evidence**; it does not automatically declare mastery, and it stays separate
from FSRS review scheduling (ADR 0003).

A later iteration may verify a GitHub Actions result or a signed exercise
report instead of a manual mark.

The in-app Code Lab (separate from these local exercises) emits structured AI
feedback with a stable error-tag schema (`weak_ai_inference`) that future
remediation/mastery work can consume; it remains advisory and never overrides
deterministic compile/test results. It can also show skill-resolved boundary-case
checklists (#411) as strategy hints (no mastery impact). Selected single-file
capstone milestones (#418) are practiced directly in the Code Lab, with
completion gated on passing the visible tests; larger work stays in Codespaces.
See [CODE_LAB.md](CODE_LAB.md).

## Current Exercises

| id | skills | lab |
| --- | --- | --- |
| `io-grade-calculator` | console I/O, variables, conversions, conditionals | `text-statistics-analyzer` |
| `strings-valid-palindrome` | palindromes, two pointers, case handling | `text-statistics-analyzer` |
| `dsa-binary-search-lower-bound` | binary search, array indexing | `math-technique-playground` |
| `strings-anagram-check` | character frequency, hashing | `text-statistics-analyzer` |
| `dsa-max-subarray-sum` | DP design, prefix sums | `math-technique-playground` |
| `raii-scoped-array` | RAII lifetime/cleanup, move semantics | `note-manager` |
| `stl-text-stats` | `std::map`, STL algorithms, parsing | `text-statistics-analyzer` |
| `trie-autocomplete` | trie, character handling, prefix queries | `dictionary-autocomplete` |
| `dsa-two-sum-sorted` | two pointers, Big-O | `csv-table-summarizer` |
| `tooling-status-parser` | debugging method, unit/regression tests, warnings, sanitizers, CMake | `debugging-toolchain-lab` |
| `filesystem-inventory` | filesystem, file streams, stream validation | `directory-inventory-reporter` |
| `concurrency-task-queue` | threads, mutexes, condition variables, shared-state design | `task-queue-lab` |
| `graph-maze-shortest-path` | graph BFS, connected components, shortest paths | `maze-route-planner` |
| `math-combination-generator` | counting principle, combination generation, bitmask subsets | `math-technique-playground` |

## Maintaining Exercises (CI)

`scripts/exercises/verify-all.sh` builds every reference solution and confirms
it passes its own tests, and builds every starter (which is expected to fail the
tests until implemented). Run it before changing an exercise:

```bash
scripts/exercises/verify-all.sh        # EX_SANITIZE=0 on MinGW
```

The CI `C++ exercises` job runs `scripts/exercises/verify-all.sh`, so starter
and solution builds are validated on every change from a clean Linux checkout.
