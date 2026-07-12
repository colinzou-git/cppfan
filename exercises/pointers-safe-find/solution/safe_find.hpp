// Reference solution for pointers-safe-find.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

inline const int* find_first(const std::vector<int>& values, int target) {
  for (const int& v : values) {
    if (v == target) {
      return &v;
    }
  }
  return nullptr;
}

inline int* find_first_mutable(std::vector<int>& values, int target) {
  for (int& v : values) {
    if (v == target) {
      return &v;
    }
  }
  return nullptr;
}

inline bool contains(const std::vector<int>& values, int target) {
  return find_first(values, target) != nullptr;
}
