# DP: word break

Given a string `s` and a dictionary of words, return whether `s` can be
segmented into a sequence of one or more dictionary words. Words may be reused,
and every character must be covered.

Implement `word_break` in `word_break.hpp`:

```cpp
bool word_break(const std::string& s, const std::vector<std::string>& dict);
```

Approach:
- Let `dp[i]` mean "the first `i` characters of `s` can be segmented". `dp[0]` is
  `true`.
- For each end `i`, scan split points `j < i`: if `dp[j]` is `true` and
  `s[j..i)` is in the dictionary, then `dp[i]` is `true`.
- Put the dictionary in an `unordered_set` for O(1) lookups; the answer is
  `dp[s.size()]`.

Examples: `"leetcode"` with `{"leet","code"}` → `true`; `"catsandog"` with
`{"cats","dog","sand","and","cat"}` → `false`.

Only edit `word_break.hpp`. Do not change the interface or the tests.
