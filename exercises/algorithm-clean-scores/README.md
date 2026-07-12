# STL: clean a score list

**Skills:** STL algorithms, std::vector, lambdas
· **Difficulty:** intermediate · **~25 min**

Clean a list of scores using STL algorithms.

## Requirements

- Drop every score outside the inclusive range `[lo, hi]`.
- Sort the survivors in ascending order.
- Remove duplicates so each value appears once.
- Return the cleaned vector.

Idiomatic tools: `std::remove_if` + `erase`, `std::sort`, `std::unique` + `erase`.

Edit only `clean_scores.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh algorithm-clean-scores
# ...edit exercises/algorithm-clean-scores/work/clean_scores.hpp...
scripts/exercises/test.sh algorithm-clean-scores
scripts/exercises/reset.sh algorithm-clean-scores
```

When all tests pass, mark the exercise complete in cppFan.
