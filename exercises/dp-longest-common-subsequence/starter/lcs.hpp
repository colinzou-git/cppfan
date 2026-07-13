// Exercise: dp-longest-common-subsequence
// Length of the longest common subsequence (LCS) of two strings.
//
// Rules:
//  - A subsequence keeps order but may skip characters; it need not be contiguous.
//  - Return the LENGTH of the longest sequence that is a subsequence of both a and b.
//  - Either empty string gives 0.
//  - Classic DP: if a[i-1]==b[j-1], dp[i][j]=dp[i-1][j-1]+1; else max(dp[i-1][j], dp[i][j-1]).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>

inline int lcs_length(const std::string& a, const std::string& b) {
  // TODO: fill a DP table (or two rolling rows) and return the corner value.
  (void)a;
  (void)b;
  return 0;
}
