# Binary search: first and last position

**Skills:** binary search, two pointers, Big-O
· **Difficulty:** intermediate · **~30 min**

Find the first and last positions of a target in a sorted vector.

## Requirements

- `nums` is sorted non-decreasing (may contain duplicates).
- Return `{first_index, last_index}` of `target`, or `{-1, -1}` if absent.
- Use binary search: O(log n), not a linear scan.

Hint: run two binary searches — one biased left (first), one biased right (last).

Edit only `first_last.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh binary-search-first-last
# ...edit exercises/binary-search-first-last/work/first_last.hpp...
scripts/exercises/test.sh binary-search-first-last
scripts/exercises/reset.sh binary-search-first-last
```

When all tests pass, mark the exercise complete in cppFan.
