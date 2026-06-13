# DSA: two-sum on a sorted array

**Skills:** two pointers, Big-O reasoning
· **Difficulty:** intermediate · **~25 min**

Given a vector sorted in non-decreasing order and a target, find two distinct
positions whose values sum to the target — using the two-pointer technique.

## Requirements

- Return a `{i, j}` pair with `i < j` and `nums[i] + nums[j] == target`.
- If several answers exist, return the one with the smallest `i`.
- If no pair sums to the target, return `{-1, -1}`.
- Run in **O(n)** time and **O(1)** extra space (no nested loop, no hash map).

Edit only `two_sum.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh dsa-two-sum-sorted
# ...edit exercises/dsa-two-sum-sorted/work/two_sum.hpp...
scripts/exercises/test.sh dsa-two-sum-sorted
scripts/exercises/reset.sh dsa-two-sum-sorted
```

When all tests pass, mark the exercise complete in cppFan.
