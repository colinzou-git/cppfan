// Reference solution for bit-single-number.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

inline int single_number(const std::vector<int>& nums) {
  int acc = 0;
  for (int value : nums) {
    acc ^= value;  // paired values cancel; the unique value remains
  }
  return acc;
}
