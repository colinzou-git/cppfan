// Reference solution for greedy-jump-game.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

// nums[i] is the maximum forward jump from index i. Can we reach the last index?
// Greedy: track the farthest reachable index as we scan.
inline bool can_jump(const std::vector<int>& nums) {
  if (nums.empty()) {
    return true;
  }
  std::size_t reach = 0;
  const std::size_t last = nums.size() - 1;
  for (std::size_t i = 0; i < nums.size(); ++i) {
    if (i > reach) {
      return false;  // stuck before this index
    }
    const std::size_t far = i + static_cast<std::size_t>(nums[i]);
    if (far > reach) {
      reach = far;
    }
    if (reach >= last) {
      return true;
    }
  }
  return true;
}
