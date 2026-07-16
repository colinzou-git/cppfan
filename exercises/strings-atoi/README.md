# Strings: string to integer (atoi)

Implement `str_to_int(s)`, a simplified version of C's `atoi` / the classic
`myAtoi` interview problem.

## Rules

1. Skip any leading spaces.
2. Read an optional single `'+'` or `'-'` sign.
3. Read consecutive digits, accumulating the value; stop at the first
   non-digit character.
4. Clamp the result to the 32-bit signed range
   `[-2147483648, 2147483647]` — overflow must **not** wrap.
5. If no digits are read, return `0`.

## Examples

| Input | Output |
|---|---|
| `"42"` | `42` |
| `"   -42"` | `-42` |
| `"4193 with words"` | `4193` |
| `"words and 987"` | `0` |
| `"2147483648"` | `2147483647` (clamped) |

## Files

- `starter/str_to_int.hpp` — implement here.
- `tests/tests.cpp` — the checks your solution must pass.
