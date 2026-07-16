// Reference solution for strings-reverse-vowels.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <string>

inline std::string reverse_vowels(std::string s) {
  auto is_vowel = [](char c) {
    switch (c) {
      case 'a': case 'e': case 'i': case 'o': case 'u':
      case 'A': case 'E': case 'I': case 'O': case 'U':
        return true;
      default:
        return false;
    }
  };
  int i = 0;
  int j = static_cast<int>(s.size()) - 1;
  while (i < j) {
    if (!is_vowel(s[i])) {
      ++i;
    } else if (!is_vowel(s[j])) {
      --j;
    } else {
      std::swap(s[i], s[j]);
      ++i;
      --j;
    }
  }
  return s;
}
