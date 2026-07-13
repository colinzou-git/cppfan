# Intervals: merge meetings

**Skills:** interval scheduling, comparators, Big-O
· **Difficulty:** intermediate · **~30 min**

Merge overlapping meeting intervals.

## Requirements

- Each `Interval` has a `start` and `end` with `start <= end`.
- Merge intervals that overlap **or** touch: `[1,3]` and `[3,5]` merge into `[1,5]`.
- The result is sorted by `start`; input may be unsorted.
- An empty input returns an empty result.

Edit only `merge_intervals.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh interval-merge-meetings
# ...edit exercises/interval-merge-meetings/work/merge_intervals.hpp...
scripts/exercises/test.sh interval-merge-meetings
scripts/exercises/reset.sh interval-merge-meetings
```

When all tests pass, mark the exercise complete in cppFan.
