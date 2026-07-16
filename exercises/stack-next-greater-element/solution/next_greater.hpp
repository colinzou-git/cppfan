// Reference solution for stack-next-greater-element.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <cstddef>
#include <vector>

inline std::vector<int> next_greater(const std::vector<int>& nums) {
  const std::size_t n = nums.size();
  std::vector<int> answer(n, -1);
  std::vector<std::size_t> stack;  // indices awaiting a greater element
  for (std::size_t i = 0; i < n; ++i) {
    while (!stack.empty() && nums[i] > nums[stack.back()]) {
      answer[stack.back()] = nums[i];
      stack.pop_back();
    }
    stack.push_back(i);
  }
  return answer;
}
