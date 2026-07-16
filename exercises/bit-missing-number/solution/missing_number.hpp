// Reference solution for bit-missing-number.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

inline int missing_number(const std::vector<int>& nums) {
  int n = static_cast<int>(nums.size());
  int acc = n;  // include the top index n up front
  for (int i = 0; i < n; ++i) {
    acc ^= i ^ nums[i];  // index and value pairs cancel; the gap remains
  }
  return acc;
}
