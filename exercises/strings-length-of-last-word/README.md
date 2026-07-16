# Strings: length of last word

Implement `last_word_length(s)`: return the length of the **last word** in the
string. Words are maximal runs of non-space characters; trailing spaces are
ignored.

## Approach

1. Start at the end of the string and skip any trailing spaces.
2. Count consecutive non-space characters until you reach a space or the start.
3. An empty or all-spaces string has length `0`.

## Examples

| Input | Output |
|---|---|
| `"Hello World"` | `5` |
| `"   fly me   to   the moon  "` | `4` |
| `"luffy is still joyboy"` | `6` |
| `"     "` | `0` |

## Files

- `starter/last_word_length.hpp` — implement here.
- `tests/tests.cpp` — the checks your solution must pass.
