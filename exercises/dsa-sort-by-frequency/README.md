# DSA: sort by frequency

**Skills:** custom comparators, hash lookup
· **Difficulty:** intermediate · **~25 min**

Sort a vector by how often each value occurs (ascending), breaking ties by the
value itself — a custom-comparator exercise.

## Requirements

- `sort_by_frequency(nums)` returns the values reordered so that less frequent
  values come first; equal frequencies are ordered by ascending value.
- Example: `{1, 1, 2, 2, 2, 3}` → `{3, 1, 1, 2, 2, 2}`.
- Count occurrences first (a map), then `std::sort` with a custom comparator.

Edit only `sort_by_frequency.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh dsa-sort-by-frequency
# edit exercises/dsa-sort-by-frequency/work/sort_by_frequency.hpp
scripts/exercises/test.sh dsa-sort-by-frequency
```

Or solve it in-app at `/lab/dsa-sort-by-frequency`.
