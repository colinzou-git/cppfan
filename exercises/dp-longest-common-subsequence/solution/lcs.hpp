// Reference solution for dp-longest-common-subsequence.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <string>
#include <vector>

// Length of the longest subsequence common to a and b. Classic 2-D DP compacted
// to two rolling rows.
inline int lcs_length(const std::string& a, const std::string& b) {
  const std::size_t n = b.size();
  std::vector<int> prev(n + 1, 0);
  std::vector<int> cur(n + 1, 0);
  for (std::size_t i = 1; i <= a.size(); ++i) {
    for (std::size_t j = 1; j <= n; ++j) {
      if (a[i - 1] == b[j - 1]) {
        cur[j] = prev[j - 1] + 1;
      } else {
        cur[j] = std::max(prev[j], cur[j - 1]);
      }
    }
    std::swap(prev, cur);
  }
  return prev[n];
}
