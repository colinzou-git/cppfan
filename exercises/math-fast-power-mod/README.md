# Math: fast modular exponentiation

**Skills:** modular arithmetic, number theory, bit manipulation
· **Difficulty:** intermediate · **~25 min**

Compute `(base^exp) mod m` efficiently with binary exponentiation.

## Requirements

- Preconditions: `exp >= 0` and `m >= 1`.
- Return a value in `[0, m)`. When `m == 1` the answer is 0.
- Run in O(log exp): square the base and halve the exponent each step.
- Guard the multiply against overflow (e.g. cast to `__int128` before `% m`).

Edit only `fast_power.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh math-fast-power-mod
# ...edit exercises/math-fast-power-mod/work/fast_power.hpp...
scripts/exercises/test.sh math-fast-power-mod
scripts/exercises/reset.sh math-fast-power-mod
```

When all tests pass, mark the exercise complete in cppFan.
