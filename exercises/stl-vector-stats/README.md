# STL: vector statistics

**Skills:** `std::vector`, STL algorithms
· **Difficulty:** beginner · **~20 min**

Summarize a non-empty vector of integers — minimum, maximum, sum, and mean — using
the standard algorithms.

## Requirements

- `summarize(nums)` returns a `VectorStats` with `min`, `max`, `sum` (a
  `long long`), and `mean` (sum / count, a `double`).
- `nums` is non-empty.
- Prefer `std::min_element`, `std::max_element`, and `std::accumulate` over
  hand-written loops; accumulate into a `long long` to avoid overflow.

Edit only `vector_stats.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh stl-vector-stats
# edit exercises/stl-vector-stats/work/vector_stats.hpp
scripts/exercises/test.sh stl-vector-stats
```

Or solve it in-app at `/lab/stl-vector-stats`.
