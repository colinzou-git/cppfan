# DSA: binary search lower bound

**Skills:** binary search, array indexing
· **Difficulty:** intermediate · **~25 min**

Find the lower bound of a target in a sorted vector — the first index whose value
is `>= target`, or `size()` if every element is smaller.

## Requirements

- `lower_bound_index(nums, target)` returns the index of the first element `>=`
  target (the insertion point that keeps the vector sorted).
- If every element is `<` target, return `nums.size()`.
- `nums` is sorted non-decreasing and may contain duplicates.
- Run in **O(log n)** time with a binary search — no linear scan.

Edit only `lower_bound.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh dsa-binary-search-lower-bound
# edit exercises/dsa-binary-search-lower-bound/work/lower_bound.hpp
scripts/exercises/test.sh dsa-binary-search-lower-bound
```

Or solve it in-app at `/lab/dsa-binary-search-lower-bound`.
