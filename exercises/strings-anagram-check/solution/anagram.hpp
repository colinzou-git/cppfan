// Reference solution for strings-anagram-check.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <array>
#include <cctype>
#include <string>

inline bool are_anagrams(const std::string& a, const std::string& b) {
  std::array<int, 256> counts{};
  for (char ch : a) {
    const unsigned char c = static_cast<unsigned char>(ch);
    if (std::isspace(c)) continue;
    ++counts[static_cast<unsigned char>(std::tolower(c))];
  }
  for (char ch : b) {
    const unsigned char c = static_cast<unsigned char>(ch);
    if (std::isspace(c)) continue;
    --counts[static_cast<unsigned char>(std::tolower(c))];
  }
  for (int n : counts) {
    if (n != 0) return false;
  }
  return true;
}
