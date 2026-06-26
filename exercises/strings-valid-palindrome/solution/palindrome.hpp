// Reference solution for strings-valid-palindrome.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <cctype>
#include <string>

inline bool is_palindrome(const std::string& s) {
  int lo = 0;
  int hi = static_cast<int>(s.size()) - 1;
  while (lo < hi) {
    const unsigned char lc = static_cast<unsigned char>(s[lo]);
    const unsigned char hc = static_cast<unsigned char>(s[hi]);
    if (!std::isalnum(lc)) {
      ++lo;
    } else if (!std::isalnum(hc)) {
      --hi;
    } else {
      if (std::tolower(lc) != std::tolower(hc)) return false;
      ++lo;
      --hi;
    }
  }
  return true;
}
