// Reference solution for strings-is-subsequence.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <cstddef>
#include <string>

inline bool is_subsequence(const std::string& s, const std::string& t) {
  std::size_t i = 0;
  for (std::size_t j = 0; j < t.size() && i < s.size(); ++j) {
    if (s[i] == t[j]) {
      ++i;  // matched the next needed character of s
    }
  }
  return i == s.size();
}
