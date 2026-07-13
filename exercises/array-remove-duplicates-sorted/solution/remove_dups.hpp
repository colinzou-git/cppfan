// Reference solution for array-remove-duplicates-sorted.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

// In place: compact a sorted vector so nums[0..k-1] holds each value once, in
// order. Returns k. Elements past k are left unspecified.
inline int remove_duplicates(std::vector<int>& nums) {
  if (nums.empty()) {
    return 0;
  }
  std::size_t write = 1;
  for (std::size_t read = 1; read < nums.size(); ++read) {
    if (nums[read] != nums[write - 1]) {
      nums[write] = nums[read];
      ++write;
    }
  }
  return static_cast<int>(write);
}
