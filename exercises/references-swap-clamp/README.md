# References: swap and clamp

**Skills:** references, parameter passing, const-correctness
· **Difficulty:** beginner · **~20 min**

Practice reference parameters and const-correctness with four tiny functions.

## Requirements

- `swap_ints(a, b)` — exchange the two ints through references (no return).
- `clamp_value(value, lo, hi)` — return `value` pinned to `[lo, hi]`, taking
  arguments **by value** (does not modify the caller).
- `clamp_in_place(value, lo, hi)` — clamp `value` through its reference.
- `max_of(a, b)` — return the larger, reading through **const** references
  (must not modify the arguments).

Edit only `swap_clamp.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh references-swap-clamp
# ...edit exercises/references-swap-clamp/work/swap_clamp.hpp...
scripts/exercises/test.sh references-swap-clamp
scripts/exercises/reset.sh references-swap-clamp
```

When all tests pass, mark the exercise complete in cppFan.
