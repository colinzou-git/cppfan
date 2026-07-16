// Reference solution for dp-word-break.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <string>
#include <unordered_set>
#include <vector>

inline bool word_break(const std::string& s, const std::vector<std::string>& dict) {
  const std::unordered_set<std::string> words(dict.begin(), dict.end());
  const int n = static_cast<int>(s.size());
  std::vector<char> dp(n + 1, false);
  dp[0] = true;
  for (int i = 1; i <= n; ++i) {
    for (int j = 0; j < i; ++j) {
      if (dp[j] && words.count(s.substr(j, i - j)) > 0) {
        dp[i] = true;
        break;
      }
    }
  }
  return dp[n];
}
