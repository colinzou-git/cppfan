// Reference solution for dsa-first-unique-char.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <array>
#include <string>

inline int first_unique_index(const std::string& s) {
  std::array<int, 256> counts{};
  for (char c : s) {
    ++counts[static_cast<unsigned char>(c)];
  }
  for (int i = 0; i < static_cast<int>(s.size()); ++i) {
    if (counts[static_cast<unsigned char>(s[i])] == 1) return i;
  }
  return -1;
}
