// Reference solution for strings-roman-to-integer.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <cstddef>
#include <string>

inline int roman_to_integer(const std::string& s) {
  auto value = [](char c) -> int {
    switch (c) {
      case 'I': return 1;
      case 'V': return 5;
      case 'X': return 10;
      case 'L': return 50;
      case 'C': return 100;
      case 'D': return 500;
      case 'M': return 1000;
      default: return 0;
    }
  };
  int total = 0;
  for (std::size_t i = 0; i < s.size(); ++i) {
    int cur = value(s[i]);
    if (i + 1 < s.size() && cur < value(s[i + 1])) {
      total -= cur;  // subtractive pair, e.g. IV, IX, XL
    } else {
      total += cur;
    }
  }
  return total;
}
