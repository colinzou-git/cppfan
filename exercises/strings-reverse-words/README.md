# Strings: reverse the word order

Reverse the **order of the words** in a sentence (not the letters within each
word). Words are runs of non-space characters. Collapse any run of spaces to a
single separator, and drop leading and trailing spaces.

Implement `reverse_words` in `reverse_words.hpp`:

```cpp
std::string reverse_words(const std::string& text);
```

Examples:
- `"the sky is blue"` → `"blue is sky the"`
- `"  hello world  "` → `"world hello"`
- `"a good   example"` → `"example good a"`

Rules:
- Multiple, leading, and trailing spaces are normalized to single spaces with
  none at the ends.
- An input with no words returns `""`.
- `std::istringstream` with `>>` skips whitespace and yields one word at a time.

Only edit `reverse_words.hpp`. Do not change the interface or the tests.
