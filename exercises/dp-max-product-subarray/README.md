# DP: maximum product subarray

Return the largest product of any **contiguous, non-empty** subarray.

Implement `max_product` in `max_product.hpp`:

```cpp
int max_product(const std::vector<int>& nums);
```

Approach:
- A negative number flips the largest and smallest running products, so track
  **both** the max and the min product ending at each index.
- At each `x`: `new_max = max(x, x*max, x*min)` and
  `new_min = min(x, x*max, x*min)`.
- The answer is the best `new_max` across the whole array.

Examples: `{2,3,-2,4}` → `6`; `{-2,3,-4}` → `24`; `{-1,-3,-10,-2}` → `60`.

Only edit `max_product.hpp`. Do not change the interface or the tests.
