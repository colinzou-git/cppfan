# Bit manipulation: single number (appears three times)

Every value in `nums` appears exactly **three** times except one value, which
appears once. Implement `single_number(nums)` to return that unique value.

## Approach

Plain XOR (which solves the "appears twice" variant) does not work here, because
three copies of a value do not cancel. Instead, count set bits per position:

1. For each of the 32 bit positions, sum how many array values have that bit set.
2. Each tripled number contributes a multiple of 3 to every position's count.
3. A bit whose total count is **not** divisible by 3 must belong to the unique
   number. Combine those bits to reconstruct the answer.

This handles negatives correctly when you treat the value as its 32-bit
two's-complement pattern.

## Examples

| Input | Output |
|---|---|
| `[2, 2, 3, 2]` | `3` |
| `[0, 1, 0, 1, 0, 1, 99]` | `99` |
| `[-2, -2, -2, 5]` | `5` |

## Files

- `starter/single_number.hpp` — implement here.
- `tests/tests.cpp` — the checks your solution must pass.
