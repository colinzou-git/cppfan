// Reference solution for strings-longest-palindrome-buildable.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <array>
#include <string>

inline int longest_palindrome(const std::string& s) {
  std::array<int, 256> freq{};
  for (unsigned char c : s) {
    ++freq[c];
  }
  int length = 0;
  bool has_odd = false;
  for (int count : freq) {
    length += count / 2 * 2;  // the largest even number of this char
    if (count % 2 == 1) {
      has_odd = true;  // a leftover single can go in the center
    }
  }
  return length + (has_odd ? 1 : 0);
}
