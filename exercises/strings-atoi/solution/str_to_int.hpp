// Reference solution for strings-atoi.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <cstddef>
#include <string>

inline int str_to_int(const std::string& s) {
  const long long kMax = 2147483647LL;
  const long long kMin = -2147483648LL;
  std::size_t i = 0;
  while (i < s.size() && s[i] == ' ') ++i;
  int sign = 1;
  if (i < s.size() && (s[i] == '+' || s[i] == '-')) {
    if (s[i] == '-') sign = -1;
    ++i;
  }
  long long value = 0;
  while (i < s.size() && s[i] >= '0' && s[i] <= '9') {
    value = value * 10 + (s[i] - '0');
    if (sign == 1 && value > kMax) return static_cast<int>(kMax);
    if (sign == -1 && -value < kMin) return static_cast<int>(kMin);
    ++i;
  }
  return static_cast<int>(sign * value);
}
