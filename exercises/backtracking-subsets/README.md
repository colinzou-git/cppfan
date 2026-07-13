# Backtracking: subsets

**Skills:** recursion base cases, recursion choices, combinatorics
· **Difficulty:** intermediate · **~30 min**

Generate the power set (all subsets) of distinct integers.

## Requirements

- Return every subset, including the empty subset and the full set.
- For a deterministic result, sort the input first, keep each subset ascending,
  and sort the final list of subsets.
- For `n` distinct inputs there are exactly `2^n` subsets.

Backtracking: at each element, branch on "include it" vs "skip it".

Edit only `subsets.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh backtracking-subsets
# ...edit exercises/backtracking-subsets/work/subsets.hpp...
scripts/exercises/test.sh backtracking-subsets
scripts/exercises/reset.sh backtracking-subsets
```

When all tests pass, mark the exercise complete in cppFan.
