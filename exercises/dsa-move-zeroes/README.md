# DSA: move zeroes to the end

**Skills:** two pointers, array traversal
· **Difficulty:** beginner · **~20 min**

Move all zeroes to the end of a vector while keeping the relative order of the
non-zero values — a stable two-pointer rearrangement.

## Requirements

- `move_zeroes(nums)` returns the vector with every `0` moved after all the
  non-zero values, preserving the order of the non-zero values.
- Example: `{0, 1, 0, 3, 12}` → `{1, 3, 12, 0, 0}`.
- Two indices, O(n): a write position trailing a read scan.

Edit only `move_zeroes.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh dsa-move-zeroes
# edit exercises/dsa-move-zeroes/work/move_zeroes.hpp
scripts/exercises/test.sh dsa-move-zeroes
```

Or solve it in-app at `/lab/dsa-move-zeroes`.
