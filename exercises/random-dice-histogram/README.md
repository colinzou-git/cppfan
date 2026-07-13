# Utilities: seeded dice histogram

**Skills:** random engines, RNG reproducibility, traversal
· **Difficulty:** beginner · **~20 min**

Roll a die deterministically and tally the faces.

## Requirements

- Seed a `std::mt19937` with `seed` and roll `rolls` times.
- Map each engine output to a face with `rng() % 6` (faces 0..5 internally).
- Return the counts of the six faces in a `std::array<int, 6>` (index 0 is the
  first face).
- Because `mt19937` is standardized, the same seed always gives the same tally.

Edit only `dice_histogram.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh random-dice-histogram
# ...edit exercises/random-dice-histogram/work/dice_histogram.hpp...
scripts/exercises/test.sh random-dice-histogram
scripts/exercises/reset.sh random-dice-histogram
```

When all tests pass, mark the exercise complete in cppFan.
