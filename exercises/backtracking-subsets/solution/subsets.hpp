// Reference solution for backtracking-subsets.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <cstddef>
#include <functional>
#include <vector>

// All subsets (the power set) of distinct integers. Input is sorted first, then
// backtracking builds each subset; the result is sorted for a stable order.
inline std::vector<std::vector<int>> subsets(std::vector<int> nums) {
  std::sort(nums.begin(), nums.end());
  std::vector<std::vector<int>> result;
  std::vector<int> current;

  std::function<void(std::size_t)> go = [&](std::size_t i) {
    if (i == nums.size()) {
      result.push_back(current);
      return;
    }
    go(i + 1);  // exclude nums[i]
    current.push_back(nums[i]);
    go(i + 1);  // include nums[i]
    current.pop_back();
  };
  go(0);

  std::sort(result.begin(), result.end());
  return result;
}
