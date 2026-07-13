# Arrays: remove duplicates in place

**Skills:** two pointers, array traversal, Big-O
· **Difficulty:** beginner · **~20 min**

Remove duplicates from a **sorted** vector in place, using two pointers.

## Requirements

- After the call, `nums[0..k-1]` holds each distinct value once, in sorted
  order, where `k` is the returned length.
- Elements at or beyond index `k` do not matter.
- O(n) time and O(1) extra space (no new container).
- An empty vector returns 0.

Edit only `remove_dups.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh array-remove-duplicates-sorted
# ...edit exercises/array-remove-duplicates-sorted/work/remove_dups.hpp...
scripts/exercises/test.sh array-remove-duplicates-sorted
scripts/exercises/reset.sh array-remove-duplicates-sorted
```

When all tests pass, mark the exercise complete in cppFan.
