# DP: coin change (count combinations)

Implement `count_ways(coins, amount)`: the number of distinct combinations of
coins (unlimited supply of each denomination) that sum exactly to `amount`.
Combinations that differ only in order count once.

## Approach

1. `ways[0] = 1` — there is exactly one way to make 0 (choose nothing).
2. Loop **coins on the outside**, amounts on the inside. This is what prevents
   counting `1+2` and `2+1` as two different combinations.
3. For each coin `c`, add `ways[t - c]` to `ways[t]` for every `t` from `c` to
   `amount`.

## Examples

| Coins | Amount | Output | Combinations |
|---|---|---|---|
| `[1, 2, 5]` | `5` | `4` | `5`, `2+2+1`, `2+1+1+1`, `1+1+1+1+1` |
| `[2]` | `3` | `0` | none |
| `[1, 2, 5]` | `0` | `1` | empty selection |
| `[1, 2, 3]` | `4` | `4` | `1+1+1+1`, `1+1+2`, `2+2`, `1+3` |

## Files

- `starter/count_ways.hpp` — implement here.
- `tests/tests.cpp` — the checks your solution must pass.
