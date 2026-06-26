// Reference solution for dsa-move-zeroes.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

inline std::vector<int> move_zeroes(std::vector<int> nums) {
  std::size_t insert = 0;
  for (int value : nums) {
    if (value != 0) {
      nums[insert++] = value;
    }
  }
  while (insert < nums.size()) {
    nums[insert++] = 0;
  }
  return nums;
}
