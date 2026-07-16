# Matrix: spiral order

Return the elements of an `m x n` matrix in **clockwise spiral order**, starting
at the top-left corner.

Implement `spiral_order` in `spiral_order.hpp`:

```cpp
std::vector<int> spiral_order(const std::vector<std::vector<int>>& matrix);
```

Approach:
- Keep four boundaries: `top`, `bottom`, `left`, `right`. Walk the top row
  left-to-right, the right column top-to-bottom, the bottom row right-to-left,
  then the left column bottom-to-top.
- After each edge, move that boundary inward (`top++`, `right--`, `bottom--`,
  `left++`).
- Guard the bottom row and left column with `top <= bottom` and `left <= right`
  so a thin remaining strip is not visited twice. An empty matrix returns an
  empty vector.

Example: `{{1,2,3},{4,5,6},{7,8,9}}` → `{1,2,3,6,9,8,7,4,5}`.

Only edit `spiral_order.hpp`. Do not change the interface or the tests.
