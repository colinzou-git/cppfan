// Reference solution for strings-length-of-last-word.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <string>

inline int last_word_length(const std::string& s) {
  int i = static_cast<int>(s.size()) - 1;
  while (i >= 0 && s[i] == ' ') {
    --i;
  }
  int length = 0;
  while (i >= 0 && s[i] != ' ') {
    ++length;
    --i;
  }
  return length;
}
