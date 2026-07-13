# Utilities: optional parse int

**Skills:** input validation, parsing edge cases, functions
· **Difficulty:** intermediate · **~25 min**

Parse a whole string as an int, returning `std::optional<int>`.

## Requirements

- Return the value only when the **entire** string is a valid int.
- Return `std::nullopt` for: empty input, non-digit characters, surrounding
  whitespace, or a value that overflows `int`.
- A single leading `+` is allowed (`"+3"`); `-` is allowed for negatives.

`std::from_chars` reports both an error code and how far it parsed — use both.

Edit only `parse_int.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh optional-parse-int
# ...edit exercises/optional-parse-int/work/parse_int.hpp...
scripts/exercises/test.sh optional-parse-int
scripts/exercises/reset.sh optional-parse-int
```

When all tests pass, mark the exercise complete in cppFan.
