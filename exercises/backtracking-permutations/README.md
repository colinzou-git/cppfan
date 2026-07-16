# Backtracking: all permutations

Return every **permutation** (ordering) of the given distinct integers. The
result is sorted for a stable, lexicographic order.

Implement `permutations` in `permutations.hpp`:

```cpp
std::vector<std::vector<int>> permutations(std::vector<int> nums);
```

Approach:
- Sort the input first so the collected permutations come out in lexicographic
  order.
- Track which indices are already used; at each step, try every unused element,
  recurse, then undo the choice (classic backtracking).
- The base case is when the current ordering has the same length as the input —
  record a copy of it.

Examples: `permutations({1,2})` → `{{1,2},{2,1}}`; `permutations({1,2,3})` has 6
orderings.

Only edit `permutations.hpp`. Do not change the interface or the tests.
