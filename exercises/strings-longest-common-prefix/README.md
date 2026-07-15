# Strings: longest common prefix

Return the longest string that is a prefix of **every** string in the input.
If there is no common prefix (or the list is empty), return an empty string.

Implement `longest_common_prefix` in `common_prefix.hpp`:

```cpp
std::string longest_common_prefix(const std::vector<std::string>& words);
```

Rules:
- The result is a prefix shared by all words; it is at most as long as the
  shortest word.
- An empty list, or words whose first characters already differ, gives `""`.
- Compare character by character across the words and stop at the first mismatch.

Only edit `common_prefix.hpp`. Do not change the interface or the tests.
