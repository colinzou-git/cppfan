// Reference solution for dsa-merge-sorted-arrays.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

inline std::vector<int> merge_sorted(const std::vector<int>& a, const std::vector<int>& b) {
  std::vector<int> out;
  out.reserve(a.size() + b.size());
  std::size_t i = 0;
  std::size_t j = 0;
  while (i < a.size() && j < b.size()) {
    if (a[i] <= b[j]) {
      out.push_back(a[i++]);
    } else {
      out.push_back(b[j++]);
    }
  }
  while (i < a.size()) out.push_back(a[i++]);
  while (j < b.size()) out.push_back(b[j++]);
  return out;
}
