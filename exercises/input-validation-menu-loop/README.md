# Utilities: validate menu input

**Skills:** input validation, loops, parsing edge cases
· **Difficulty:** beginner · **~20 min**

Scan a list of raw menu inputs and return the first **valid** choice.

## Requirements

- A valid choice is an integer in `[1, 4]` that fills the whole token (no extra
  characters, no surrounding spaces).
- Skip invalid entries (non-numeric, out of range, empty).
- Return the first valid choice, or `-1` if none is valid.

This models a real menu loop that keeps prompting until it gets good input.

Edit only `menu.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh input-validation-menu-loop
# ...edit exercises/input-validation-menu-loop/work/menu.hpp...
scripts/exercises/test.sh input-validation-menu-loop
scripts/exercises/reset.sh input-validation-menu-loop
```

When all tests pass, mark the exercise complete in cppFan.
