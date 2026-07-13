# Ranges: filter then transform

**Skills:** C++20 ranges, range views, lambdas
· **Difficulty:** intermediate · **~25 min**

Build a small range pipeline: keep even numbers, then square them.

## Requirements

- Return a vector containing the squares of the even inputs, in original order.
- Compose `std::views::filter` and `std::views::transform` (a C++20 ranges
  pipeline with `|`), then collect into a vector.
- Empty input (or no evens) yields an empty vector.

Edit only `ranges_pipeline.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh ranges-filter-transform
# ...edit exercises/ranges-filter-transform/work/ranges_pipeline.hpp...
scripts/exercises/test.sh ranges-filter-transform
scripts/exercises/reset.sh ranges-filter-transform
```

When all tests pass, mark the exercise complete in cppFan.
