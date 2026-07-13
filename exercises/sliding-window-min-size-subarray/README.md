# Sliding window: minimum size subarray sum

**Skills:** sliding window, two pointers, Big-O
· **Difficulty:** intermediate · **~30 min**

Find the smallest contiguous subarray whose sum reaches a target.

## Requirements

- All values are positive.
- Return the **length** of the shortest contiguous subarray with sum `>= target`.
- Return `0` when no subarray reaches the target.
- Aim for O(n) with a sliding window (grow right, shrink left).

Edit only `min_subarray.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh sliding-window-min-size-subarray
# ...edit exercises/sliding-window-min-size-subarray/work/min_subarray.hpp...
scripts/exercises/test.sh sliding-window-min-size-subarray
scripts/exercises/reset.sh sliding-window-min-size-subarray
```

When all tests pass, mark the exercise complete in cppFan.
