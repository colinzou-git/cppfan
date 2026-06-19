// Reference solution for math-combination-generator.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <vector>

inline long long count_combinations(int n, int k) {
  if (n < 0 || k < 0 || k > n) return 0;
  k = std::min(k, n - k);

  std::vector<long long> dp(k + 1, 0);
  dp[0] = 1;
  for (int value = 1; value <= n; ++value) {
    for (int choose = std::min(value, k); choose >= 1; --choose) {
      dp[choose] += dp[choose - 1];
    }
  }
  return dp[k];
}

inline void generate_from(int n, int k, int start, std::vector<int>& current, std::vector<std::vector<int>>& out) {
  if (static_cast<int>(current.size()) == k) {
    out.push_back(current);
    return;
  }

  const int need = k - static_cast<int>(current.size());
  for (int value = start; value <= n - need + 1; ++value) {
    current.push_back(value);
    generate_from(n, k, value + 1, current, out);
    current.pop_back();
  }
}

inline std::vector<std::vector<int>> generate_combinations(int n, int k) {
  if (n < 0 || k < 0 || k > n) return {};

  std::vector<std::vector<int>> out;
  std::vector<int> current;
  generate_from(n, k, 1, current, out);
  return out;
}

inline std::vector<int> subset_from_mask(const std::vector<int>& values, int mask) {
  std::vector<int> subset;
  for (int i = 0; i < static_cast<int>(values.size()); ++i) {
    if ((mask >> i) & 1) {
      subset.push_back(values[i]);
    }
  }
  return subset;
}
