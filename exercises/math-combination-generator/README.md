# Math: combination generator

**Skills:** counting principle, combinations, backtracking, bitmasks
**Difficulty:** advanced - **~35 min**

Implement a small math toolkit that counts combinations, generates every
k-combination of the numbers 1..n, and decodes a bitmask into a subset of values.

## Requirements

- `count_combinations(n, k)` returns C(n, k), or `0` when k is impossible.
- Use Pascal's recurrence for counting; do not hard-code factorials.
- `generate_combinations(n, k)` returns combinations in lexicographic order.
- Use choose / recurse / undo backtracking with an advancing start index.
- `subset_from_mask(values, mask)` returns the values whose bit position is set.
- State and preserve the output-bound complexity: generating C(n, k) rows is unavoidable.

Edit only `combination_generator.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh math-combination-generator
# ...edit exercises/math-combination-generator/work/combination_generator.hpp...
scripts/exercises/test.sh math-combination-generator
scripts/exercises/reset.sh math-combination-generator
```

When all tests pass, mark the exercise complete in cppFan.
