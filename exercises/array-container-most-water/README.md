# Arrays: container with most water

Each element is a vertical line height. Choose **two** lines that, together with
the x-axis, form a container holding the **most water**. Return that maximum area.

Implement `most_water` in `most_water.hpp`:

```cpp
long long most_water(const std::vector<int>& height);
```

Approach — two pointers (O(n)):
- The water between lines `i` and `j` is `min(height[i], height[j]) * (j - i)`.
- Start at the ends. The area is limited by the **shorter** line, so move that
  pointer inward to look for a taller one; track the maximum.

Contract:
- Heights are **non-negative**; fewer than two lines hold no water (return `0`).
- The area can exceed `INT_MAX`, so return **64-bit** `long long` and promote one
  operand before the multiply (e.g. `1LL * min(...) * (j - i)`) to avoid signed
  overflow.

Example: `{1,8,6,2,5,4,8,3,7}` → `49`.

Only edit `most_water.hpp`. Do not change the interface or the tests.
