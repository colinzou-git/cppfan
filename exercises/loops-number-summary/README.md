# Loops: number summary in one pass

**Skills:** loops, loop invariants, array traversal
· **Difficulty:** beginner · **~20 min**

Walk a vector of integers exactly once and report a small summary: how many
values there are, their sum, the minimum, the maximum, and how many are even.

## Requirements

- Fill in a `NumberSummary { count, sum, min, max, even_count }`.
- Use a **single pass** over the data — no sorting, no repeated scans.
- For an empty vector, return `{0, 0, 0, 0, 0}`.
- `sum` is a `long long` so many values cannot overflow it.
- A value is even when `v % 2 == 0` (this also holds for negatives).

Edit only `number_summary.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh loops-number-summary
# ...edit exercises/loops-number-summary/work/number_summary.hpp...
scripts/exercises/test.sh loops-number-summary
scripts/exercises/reset.sh loops-number-summary
```

When all tests pass, mark the exercise complete in cppFan.
