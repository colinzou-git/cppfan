# Bit manipulation: power of two

Return whether a given integer is a **power of two** (1, 2, 4, 8, 16, ...).

Implement `is_power_of_two` in `power_of_two.hpp`:

```cpp
bool is_power_of_two(int n);
```

Rules:
- A power of two has exactly **one** set bit in its binary representation.
- Zero and negative numbers are never powers of two.
- The classic trick: for `n > 0`, `n & (n - 1)` clears the lowest set bit and is
  `0` exactly when `n` had a single set bit.

Examples: `16` → `true`, `1` → `true` (2^0), `6` → `false`, `0` → `false`.

Only edit `power_of_two.hpp`. Do not change the interface or the tests.
