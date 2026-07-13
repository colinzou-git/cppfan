# DP: climbing stairs

**Skills:** dynamic programming, base cases, DP forms
· **Difficulty:** beginner · **~20 min**

Count the distinct ways to climb `n` stairs, taking 1 or 2 steps at a time.

## Requirements

- `ways(0) = ways(1) = 1`; otherwise `ways(n) = ways(n-1) + ways(n-2)`.
- Return the count as a `long long` (it grows like Fibonacci).
- O(n) time, O(1) space (iterate; no naive recursion).

Edit only `climb_stairs.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh dp-climbing-stairs
# ...edit exercises/dp-climbing-stairs/work/climb_stairs.hpp...
scripts/exercises/test.sh dp-climbing-stairs
scripts/exercises/reset.sh dp-climbing-stairs
```

When all tests pass, mark the exercise complete in cppFan.
