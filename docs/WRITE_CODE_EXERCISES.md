# Write-Code Exercises (Codespaces workflow)

Status: implemented roadmap issue #81 / #128 workflow. Quizzes, code reading,
and Parsons puzzles scaffold understanding, but proficiency needs writing,
compiling, testing, and debugging real code. These exercises run in **GitHub
Codespaces** (or any machine with a C++20 compiler); cppFan never executes
arbitrary C++ on its web server.

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

## Current Exercises

| id | skills | lab |
| --- | --- | --- |
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
