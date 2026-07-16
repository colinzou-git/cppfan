# Arrays: rotate right by k

Return the array rotated to the **right** by `k` positions. Each element at index
`i` moves to `(i + k) % n`. `k` may be larger than the array size.

Implement `rotate_right` in `rotate_right.hpp`:

```cpp
std::vector<int> rotate_right(std::vector<int> nums, int k);
```

Approach:
- Reduce `k` modulo `n` first so a large `k` is cheap; an empty array returns
  empty.
- The reversal trick: reverse the whole array, then reverse the first `k`
  elements, then reverse the rest.

Examples: `rotate_right({1,2,3,4,5}, 2)` → `{4,5,1,2,3}`; `rotate_right({1,2,3},
7)` → `{3,1,2}`.

Only edit `rotate_right.hpp`. Do not change the interface or the tests.
