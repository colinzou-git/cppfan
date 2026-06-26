# DSA: merge two sorted arrays

**Skills:** two pointers, array traversal
· **Difficulty:** beginner · **~20 min**

Merge two sorted vectors into one sorted vector — the merge step of merge sort.

## Requirements

- `merge_sorted(a, b)` returns all elements of `a` and `b` in non-decreasing order.
- Both inputs are sorted non-decreasing and may have duplicates; either may be
  empty.
- Merge with two indices in **O(n + m)** time — do not concatenate and re-sort.
- Stable: when values tie, take from `a` first.

Edit only `merge_sorted.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh dsa-merge-sorted-arrays
# edit exercises/dsa-merge-sorted-arrays/work/merge_sorted.hpp
scripts/exercises/test.sh dsa-merge-sorted-arrays
```

Or solve it in-app at `/lab/dsa-merge-sorted-arrays`.
