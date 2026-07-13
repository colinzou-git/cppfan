# DP: minimum coin change

**Skills:** dynamic programming, DP design, time/space trade-offs
· **Difficulty:** intermediate · **~30 min**

Make an amount with the fewest coins (unlimited coins of each denomination).

## Requirements

- Return the minimum number of coins summing to `amount`, or `-1` if impossible.
- `amount == 0` needs 0 coins.
- Each denomination may be used any number of times.
- Bottom-up DP: `best[a] = 1 + min over coins of best[a - coin]`.

Edit only `coin_change.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh dp-coin-change-min
# ...edit exercises/dp-coin-change-min/work/coin_change.hpp...
scripts/exercises/test.sh dp-coin-change-min
scripts/exercises/reset.sh dp-coin-change-min
```

When all tests pass, mark the exercise complete in cppFan.
