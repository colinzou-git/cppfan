# Debugging: fix the off-by-one

**Skills:** debugging method, loop invariants, loops
· **Difficulty:** beginner · **~15 min**

`range_sum(lo, hi)` should sum every integer from `lo` to `hi` **inclusive**, but
the starter has a classic off-by-one bug: it stops one short and never adds `hi`.

## Requirements

- Fix the loop boundary so the sum includes `hi`.
- Do not replace the loop with a closed-form formula — fix the bound.
- Precondition: `lo <= hi`.

Edit only `range_sum.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh debug-fix-off-by-one
# ...edit exercises/debug-fix-off-by-one/work/range_sum.hpp...
scripts/exercises/test.sh debug-fix-off-by-one
scripts/exercises/reset.sh debug-fix-off-by-one
```

When all tests pass, mark the exercise complete in cppFan.
