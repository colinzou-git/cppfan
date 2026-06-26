// Reference solution for cpp-string-split.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <string>
#include <vector>

inline std::vector<std::string> split(const std::string& s, char delim) {
  std::vector<std::string> parts;
  std::string current;
  for (char c : s) {
    if (c == delim) {
      parts.push_back(current);
      current.clear();
    } else {
      current.push_back(c);
    }
  }
  parts.push_back(current);
  return parts;
}
