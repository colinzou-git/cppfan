# Binary search: minimum shipping capacity

**Skills:** binary search on the answer, problem framing, traversal
· **Difficulty:** advanced · **~35 min**

Find the minimum daily capacity to ship all packages within `days` days.

## Setup

- `weights[i]` is the i-th package; packages ship **in order**.
- Each day you load consecutive packages without exceeding the capacity.

## Requirements

- Return the smallest capacity such that the packages fit within `days` days.
- Use "binary search on the answer": capacity is in `[max weight, total weight]`;
  a capacity is feasible when the days needed is `<= days`.
- An empty weights list — or `days <= 0` — returns 0.
- The total weight can exceed `INT_MAX`, so use **64-bit** `long long` for the
  capacity bounds, the running load, and the return value.

Edit only `min_capacity.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh binary-search-answer-capacity
# ...edit exercises/binary-search-answer-capacity/work/min_capacity.hpp...
scripts/exercises/test.sh binary-search-answer-capacity
scripts/exercises/reset.sh binary-search-answer-capacity
```

When all tests pass, mark the exercise complete in cppFan.
