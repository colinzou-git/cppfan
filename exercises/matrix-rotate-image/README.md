# Matrix: rotate image 90 degrees

Return an `n x n` matrix rotated **90 degrees clockwise**. Element `(r, c)` moves
to `(c, n-1-r)`.

Implement `rotate_image` in `rotate_image.hpp`:

```cpp
std::vector<std::vector<int>> rotate_image(const std::vector<std::vector<int>>& matrix);
```

Approach:
- Build a fresh `n x n` result and copy `result[c][n-1-r] = matrix[r][c]`.
- Equivalently: transpose the matrix, then reverse each row.
- An empty matrix rotates to an empty matrix. Do not mutate the input.

Example: `{{1,2,3},{4,5,6},{7,8,9}}` → `{{7,4,1},{8,5,2},{9,6,3}}`.

Only edit `rotate_image.hpp`. Do not change the interface or the tests.
