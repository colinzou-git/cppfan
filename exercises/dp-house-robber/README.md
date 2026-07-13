# DP: house robber

**Skills:** dynamic programming, DP design, array traversal
· **Difficulty:** intermediate · **~25 min**

Choose a subset of houses with the maximum total, never two adjacent.

## Requirements

- Return the maximum sum of values such that no two chosen houses are adjacent
  in the vector.
- An empty vector returns 0.
- O(n) time, O(1) extra space (track "best including i" vs "best excluding i").

Edit only `house_robber.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh dp-house-robber
# ...edit exercises/dp-house-robber/work/house_robber.hpp...
scripts/exercises/test.sh dp-house-robber
scripts/exercises/reset.sh dp-house-robber
```

When all tests pass, mark the exercise complete in cppFan.
