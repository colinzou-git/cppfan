// Reference solution for strings-longest-common-prefix.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <string>
#include <vector>

inline std::string longest_common_prefix(const std::vector<std::string>& words) {
  if (words.empty()) {
    return "";
  }
  const std::string& first = words[0];
  for (std::size_t pos = 0; pos < first.size(); ++pos) {
    const char c = first[pos];
    for (std::size_t w = 1; w < words.size(); ++w) {
      if (pos >= words[w].size() || words[w][pos] != c) {
        return first.substr(0, pos);
      }
    }
  }
  return first;
}
