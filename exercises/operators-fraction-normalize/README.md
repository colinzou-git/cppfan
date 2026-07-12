# Operators: a normalized Fraction

**Skills:** class invariants, struct/operator syntax, operators as functions
· **Difficulty:** intermediate · **~30 min**

Build a `Fraction` type that keeps itself normalized and overloads the `+`,
`==`, and `<<` operators. (Complements `cpp-rational-reduce`, which only reduces
a fraction — here you also add, compare, and print them.)

## Requirements

Precondition: the denominator is never 0.

- The constructor stores the fraction in lowest terms, with the sign on the
  numerator and `den > 0`: `2/4 → 1/2`, `1/-2 → -1/2`, `-3/-6 → 1/2`, `0/5 → 0/1`.
- `operator+` adds two fractions and returns a normalized result.
- `operator==` compares two fractions (equal once normalized).
- `operator<<` prints `num/den` (e.g. `3/4`).

Edit only `fraction.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh operators-fraction-normalize
# ...edit exercises/operators-fraction-normalize/work/fraction.hpp...
scripts/exercises/test.sh operators-fraction-normalize
scripts/exercises/reset.sh operators-fraction-normalize
```

When all tests pass, mark the exercise complete in cppFan.
