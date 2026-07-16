# Matrix: transpose

Return the **transpose** of an `m x n` matrix: the element at `(row r, col c)`
moves to `(row c, col r)`, producing an `n x m` matrix. Rows are equal-length
vectors of ints.

Implement `transpose` in `transpose.hpp`:

```cpp
std::vector<std::vector<int>> transpose(const std::vector<std::vector<int>>& matrix);
```

Approach:
- If the input is `m` rows by `n` columns, the result is `n` rows by `m` columns.
- Size the output first (`n` rows of `m` columns), then copy
  `result[c][r] = matrix[r][c]`.
- An empty matrix (no rows) transposes to an empty matrix. Do not mutate the
  input.

Example: `{{1,2,3},{4,5,6}}` → `{{1,4},{2,5},{3,6}}`.

Only edit `transpose.hpp`. Do not change the interface or the tests.
