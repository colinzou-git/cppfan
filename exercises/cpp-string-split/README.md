# C++: split a string

**Skills:** string parsing, `std::string`
· **Difficulty:** beginner · **~20 min**

Split a string into fields on a delimiter character, keeping empty fields — a
common everyday-C++ parsing task.

## Requirements

- `split(s, delim)` returns the substrings between each occurrence of `delim`.
- Empty fields are kept: `split("a,,b", ',')` is `{"a", "", "b"}`.
- The result has (number of delimiters + 1) entries, so `split("", ',')` is
  `{""}` and `split("a,", ',')` is `{"a", ""}`.

Edit only `split.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh cpp-string-split
# edit exercises/cpp-string-split/work/split.hpp
scripts/exercises/test.sh cpp-string-split
```

Or solve it in-app at `/lab/cpp-string-split`.
