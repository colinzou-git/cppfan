# Heaps: running median

**Skills:** heaps, heap applications, container adapters
· **Difficulty:** advanced · **~40 min**

Report the running median of a stream after each insertion.

## Requirements

- For each value read in order, append the current median of all values seen so
  far to the result.
- With an even count, the median is the average of the two middle values (so the
  result is a `double`).
- An empty stream yields an empty result.
- Use two heaps (a max-heap for the lower half and a min-heap for the upper half)
  for O(log n) per insertion — do not re-sort each time.

Edit only `running_median.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh vector-running-median-simple
# ...edit exercises/vector-running-median-simple/work/running_median.hpp...
scripts/exercises/test.sh vector-running-median-simple
scripts/exercises/reset.sh vector-running-median-simple
```

When all tests pass, mark the exercise complete in cppFan.
