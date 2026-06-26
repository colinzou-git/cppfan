# C++: reduce a fraction

**Skills:** struct invariants
· **Difficulty:** beginner · **~20 min**

Reduce a fraction to its canonical lowest-terms form — a small exercise in
maintaining a data invariant (gcd-reduced, positive denominator).

## Requirements

- `reduce(num, den)` returns a `Rational` in lowest terms.
- The denominator is always positive in the result; move any sign to the
  numerator, so `reduce(2, -4)` is `{-1, 2}`.
- `0/d` reduces to `{0, 1}`. `den` is never `0`.

Edit only `rational.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh cpp-rational-reduce
# edit exercises/cpp-rational-reduce/work/rational.hpp
scripts/exercises/test.sh cpp-rational-reduce
```

Or solve it in-app at `/lab/cpp-rational-reduce`.
