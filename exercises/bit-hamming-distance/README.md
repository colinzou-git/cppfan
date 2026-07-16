# Bit manipulation: Hamming distance

Return the **Hamming distance** between two non-negative integers — the number of
bit positions at which their binary representations differ.

Implement `hamming_distance` in `hamming_distance.hpp`:

```cpp
int hamming_distance(int a, int b);
```

Approach:
- XOR sets a bit exactly where the two operands differ, so
  `hamming_distance(a, b) == popcount(a ^ b)`.
- Count the set bits of `a ^ b` — for example, repeatedly clear the lowest set
  bit with `x &= x - 1`.

Examples: `hamming_distance(1, 4) == 2` (`0001` vs `0100`);
`hamming_distance(0, 255) == 8`.

Only edit `hamming_distance.hpp`. Do not change the interface or the tests.
