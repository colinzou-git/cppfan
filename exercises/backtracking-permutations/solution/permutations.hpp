// Reference solution for backtracking-permutations.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <cstddef>
#include <functional>
#include <vector>

inline std::vector<std::vector<int>> permutations(std::vector<int> nums) {
  std::sort(nums.begin(), nums.end());
  std::vector<std::vector<int>> result;
  std::vector<int> current;
  std::vector<char> used(nums.size(), 0);

  std::function<void()> go = [&]() {
    if (current.size() == nums.size()) {
      result.push_back(current);
      return;
    }
    for (std::size_t i = 0; i < nums.size(); ++i) {
      if (used[i]) continue;
      used[i] = 1;
      current.push_back(nums[i]);
      go();
      current.pop_back();
      used[i] = 0;
    }
  };
  go();

  std::sort(result.begin(), result.end());
  return result;
}
