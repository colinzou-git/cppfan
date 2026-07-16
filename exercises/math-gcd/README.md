# Math: greatest common divisor

Return the **greatest common divisor** (GCD) of two non-negative integers using
Euclid's algorithm.

Implement `gcd` in `gcd.hpp`:

```cpp
int gcd(int a, int b);
```

Approach:
- Euclid's algorithm: `gcd(a, b) == gcd(b, a % b)`, stopping when the second
  value reaches `0`.
- Loop form: while `b != 0`, replace `(a, b)` with `(b, a % b)`; the answer is
  `a`.
- `gcd(x, 0) == x`. Both inputs are non-negative and not both zero.

Examples: `gcd(12, 18) == 6`; `gcd(13, 7) == 1`.

Only edit `gcd.hpp`. Do not change the interface or the tests.
