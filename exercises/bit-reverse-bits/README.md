# Bit manipulation: reverse 32 bits

Implement `reverse_bits(n)`: return the unsigned 32-bit value whose bit pattern
is the reverse of `n` (bit 0 swaps with bit 31, bit 1 with bit 30, and so on).

## Approach

Build the result one bit at a time across all 32 positions:

1. Shift the result left by one.
2. OR in the lowest bit of the input (`n & 1`).
3. Shift the input right by one.

Use an unsigned type so the right shift does not sign-extend.

## Examples

| Input | Output |
|---|---|
| `43261596` | `964176192` |
| `1` | `2147483648` (`0x80000000`) |
| `0xFFFFFFFF` | `0xFFFFFFFF` |

## Files

- `starter/reverse_bits.hpp` — implement here.
- `tests/tests.cpp` — the checks your solution must pass.
