# I/O: grade calculator

**Skills:** console I/O, variables, numeric conversions, conditionals
· **Difficulty:** beginner · **~15 min**

Compute a student's average of three scores and map it to a letter grade — a
warm-up for reading input, working with `double`, and branching on thresholds.

## Requirements

- Implement `compute_grade(a, b, c)` to return a `GradeResult` with:
  - `average` = `(a + b + c) / 3.0` (a `double`; do not round it),
  - `letter` = `'A'` for average ≥ 90, `'B'` ≥ 80, `'C'` ≥ 70, `'D'` ≥ 60, else `'F'`.
- Thresholds are inclusive — exactly `90.0` is an `'A'`.

Edit only `grade_calculator.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh io-grade-calculator
# edit exercises/io-grade-calculator/work/grade_calculator.hpp
scripts/exercises/test.sh io-grade-calculator
```

Or solve it in-app at `/lab/io-grade-calculator`, where the Code Lab reads a name
and three scores from standard input and prints the average and letter grade.
