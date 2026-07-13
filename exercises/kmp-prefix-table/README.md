# Strings: KMP prefix table

**Skills:** prefix function, string searching, substrings
· **Difficulty:** advanced · **~40 min**

Build the KMP prefix function (a.k.a. failure function / `lps` array), the core
of linear-time string matching.

## Requirements

- `lps[i]` = the length of the longest **proper** prefix of `s[0..i]` that is
  also a suffix of `s[0..i]`.
- `lps` has the same length as `s`; `lps[0]` is `0`. Empty string → `{}`.
- Examples: `"aaaa" → {0,1,2,3}`, `"abcabc" → {0,0,0,1,2,3}`,
  `"abacaba" → {0,0,1,0,1,2,3}`.
- Run in O(n) using the running-length / fallback technique.

Edit only `prefix_table.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh kmp-prefix-table
# ...edit exercises/kmp-prefix-table/work/prefix_table.hpp...
scripts/exercises/test.sh kmp-prefix-table
scripts/exercises/reset.sh kmp-prefix-table
```

When all tests pass, mark the exercise complete in cppFan.
