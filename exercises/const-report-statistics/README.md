# Const-correctness: report statistics

**Skills:** const-correctness, parameter passing, array traversal
· **Difficulty:** beginner · **~20 min**

Compute summary statistics over a **read-only** vector of doubles.

## Requirements

- Take the input as `const std::vector<double>&` (read-only, no copy).
- Fill a `Stats { mean, min, max, range }` where `range == max - min`.
- For an empty vector, return `{0, 0, 0, 0}`.
- Do not modify the input and do not copy it into another container.

Edit only `report_statistics.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh const-report-statistics
# ...edit exercises/const-report-statistics/work/report_statistics.hpp...
scripts/exercises/test.sh const-report-statistics
scripts/exercises/reset.sh const-report-statistics
```

When all tests pass, mark the exercise complete in cppFan.
