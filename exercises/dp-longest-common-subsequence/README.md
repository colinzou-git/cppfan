# DP: longest common subsequence

**Skills:** dynamic programming, DP forms, subsequences
· **Difficulty:** intermediate · **~35 min**

Length of the longest common subsequence (LCS) of two strings.

## Requirements

- A subsequence keeps order but may skip characters; it need not be contiguous.
- Return the **length** of the longest sequence that is a subsequence of both
  `a` and `b`.
- Either empty string gives 0.
- DP: if `a[i-1]==b[j-1]`, `dp[i][j]=dp[i-1][j-1]+1`; else
  `max(dp[i-1][j], dp[i][j-1])`.

Edit only `lcs.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh dp-longest-common-subsequence
# ...edit exercises/dp-longest-common-subsequence/work/lcs.hpp...
scripts/exercises/test.sh dp-longest-common-subsequence
scripts/exercises/reset.sh dp-longest-common-subsequence
```

When all tests pass, mark the exercise complete in cppFan.
