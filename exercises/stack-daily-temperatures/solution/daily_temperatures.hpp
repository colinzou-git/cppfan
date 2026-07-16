// Reference solution for stack-daily-temperatures.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <cstddef>
#include <vector>

inline std::vector<int> daily_temperatures(const std::vector<int>& temps) {
  const std::size_t n = temps.size();
  std::vector<int> answer(n, 0);
  std::vector<std::size_t> stack;  // indices with no warmer day found yet
  for (std::size_t i = 0; i < n; ++i) {
    while (!stack.empty() && temps[i] > temps[stack.back()]) {
      std::size_t j = stack.back();
      stack.pop_back();
      answer[j] = static_cast<int>(i - j);
    }
    stack.push_back(i);
  }
  return answer;
}
