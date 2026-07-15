# DP: longest increasing subsequence

Return the length of the longest **strictly increasing** subsequence of an array.
A subsequence keeps the original order but may skip elements.

Implement `lis_length` in `lis.hpp`:

```cpp
int lis_length(const std::vector<int>& nums);
```

Rules:
- "Strictly increasing" means each chosen element is greater than the previous
  one; equal values cannot both be used.
- An empty array has an LIS of length 0.
- A clear O(n^2) dynamic program is fine: `dp[i]` is the length of the longest
  increasing subsequence ending at index `i`.

Only edit `lis.hpp`. Do not change the interface or the tests.
