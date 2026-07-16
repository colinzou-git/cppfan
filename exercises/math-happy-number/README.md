# Math: happy number

Implement `is_happy(n)`: return `true` iff `n` is a **happy number**.

## Definition

Repeatedly replace the number with the sum of the squares of its digits. The
number is happy if this process eventually reaches `1`; otherwise it loops
forever without reaching `1`.

## Approach

1. Compute the sum of squared digits each step.
2. Stop when you reach `1` (happy) or revisit a number you have already seen
   (a cycle — not happy).
3. Track seen values in a set, or use Floyd's slow/fast cycle detection.

## Examples

| Input | Output | Trace |
|---|---|---|
| `19` | `true` | `19 → 82 → 68 → 100 → 1` |
| `7` | `true` | `7 → 49 → 97 → 130 → 10 → 1` |
| `2` | `false` | enters a cycle |

## Files

- `starter/is_happy.hpp` — implement here.
- `tests/tests.cpp` — the checks your solution must pass.
