// Reference solution for binary-search-first-last.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <utility>
#include <vector>

// First and last index of target in a non-decreasing vector, or {-1, -1}.
inline std::pair<int, int> first_last(const std::vector<int>& nums, int target) {
  int lo = 0;
  int hi = static_cast<int>(nums.size()) - 1;
  int first = -1;
  while (lo <= hi) {
    const int mid = lo + (hi - lo) / 2;
    if (nums[mid] >= target) {
      if (nums[mid] == target) {
        first = mid;
      }
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }
  if (first == -1) {
    return {-1, -1};
  }

  lo = 0;
  hi = static_cast<int>(nums.size()) - 1;
  int last = -1;
  while (lo <= hi) {
    const int mid = lo + (hi - lo) / 2;
    if (nums[mid] <= target) {
      if (nums[mid] == target) {
        last = mid;
      }
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return {first, last};
}
