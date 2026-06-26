# DSA: maximum subarray sum

**Skills:** dynamic-programming design, prefix sums
· **Difficulty:** intermediate · **~25 min**

Find the largest sum of a non-empty contiguous subarray — the classic Kadane's
algorithm.

## Requirements

- `max_subarray_sum(nums)` returns the maximum sum over all non-empty contiguous
  subarrays of `nums`.
- `nums` is non-empty; values may be negative. If every value is negative, the
  answer is the largest single element.
- Run in **O(n)** time and **O(1)** extra space. Use `long long` to avoid overflow.

Edit only `max_subarray.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh dsa-max-subarray-sum
# edit exercises/dsa-max-subarray-sum/work/max_subarray.hpp
scripts/exercises/test.sh dsa-max-subarray-sum
```

Or solve it in-app at `/lab/dsa-max-subarray-sum`.
