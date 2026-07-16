// Reference solution for array-majority-element.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

inline int majority_element(const std::vector<int>& nums) {
  int candidate = 0;
  int count = 0;
  for (int x : nums) {
    if (count == 0) {
      candidate = x;  // adopt a new candidate
    }
    count += (x == candidate) ? 1 : -1;
  }
  return candidate;
}
