# DP: partition equal subset sum

Implement `can_partition(nums)`: return `true` iff the array can be split into
two subsets whose sums are equal.

## Approach

1. If the total sum is **odd**, no equal split is possible — return `false`.
2. Otherwise the goal is a subset that sums to `total / 2`.
3. Run a boolean subset-sum DP: `dp[t]` is `true` when some subset totals `t`.
   For each number `x`, update `t` from `target` down to `x`.

## Examples

| Input | Output | Why |
|---|---|---|
| `[1, 5, 11, 5]` | `true` | `{11}` and `{1, 5, 5}` both sum to 11 |
| `[1, 2, 3, 5]` | `false` | total 11 is odd |
| `[3, 3]` | `true` | one 3 in each half |
| `[]` | `true` | two empty halves (sum 0 each) |

## Files

- `starter/can_partition.hpp` — implement here.
- `tests/tests.cpp` — the checks your solution must pass.
