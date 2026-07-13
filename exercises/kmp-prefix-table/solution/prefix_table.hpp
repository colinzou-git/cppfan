// Reference solution for kmp-prefix-table.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <string>
#include <vector>

// KMP prefix function: lps[i] is the length of the longest proper prefix of
// s[0..i] that is also a suffix of s[0..i].
inline std::vector<int> prefix_function(const std::string& s) {
  std::vector<int> lps(s.size(), 0);
  for (std::size_t i = 1; i < s.size(); ++i) {
    int k = lps[i - 1];
    while (k > 0 && s[i] != s[static_cast<std::size_t>(k)]) {
      k = lps[static_cast<std::size_t>(k) - 1];
    }
    if (s[i] == s[static_cast<std::size_t>(k)]) {
      ++k;
    }
    lps[i] = k;
  }
  return lps;
}
