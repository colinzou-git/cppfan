# Backtracking: combination sum

**Skills:** recursion base cases, recursion choices, generating combinations
· **Difficulty:** advanced · **~35 min**

Find all combinations of candidates that sum to a target.

## Requirements

- Candidates are distinct positive integers; each may be used unlimited times.
- Return every combination (as ascending lists) whose values sum to `target`.
- Order within a combination is ascending; sort the final list. An unreachable
  target yields an empty result; `target == 0` yields one empty combination.

Backtracking: try each candidate from a start index; recurse with the same index
so it can be reused, and prune once a candidate exceeds the remainder.

Edit only `combination_sum.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh backtracking-combination-sum
# ...edit exercises/backtracking-combination-sum/work/combination_sum.hpp...
scripts/exercises/test.sh backtracking-combination-sum
scripts/exercises/reset.sh backtracking-combination-sum
```

When all tests pass, mark the exercise complete in cppFan.
