# Math: integer square root

Return `floor(sqrt(x))` for a non-negative integer `x`: the largest integer `r`
such that `r*r <= x`. Use integer arithmetic only (no `std::sqrt`).

Implement `integer_sqrt` in `integer_sqrt.hpp`:

```cpp
int integer_sqrt(int x);
```

Approach:
- Binary search `r` in `[0, x]`; compare `r*r` to `x` using a **64-bit** product
  so it does not overflow for large `x`.
- Move the lower bound up when `mid*mid <= x`, keeping the best candidate seen so
  far.
- `integer_sqrt(0) == 0`, `integer_sqrt(1) == 1`.

Examples: `integer_sqrt(8) == 2`; `integer_sqrt(144) == 12`.

Only edit `integer_sqrt.hpp`. Do not change the interface or the tests.
