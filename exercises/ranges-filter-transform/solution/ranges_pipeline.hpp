// Reference solution for ranges-filter-transform.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <ranges>
#include <vector>

// Keep the even numbers, square them, and collect the results in order.
inline std::vector<int> even_squares(const std::vector<int>& nums) {
  std::vector<int> out;
  auto pipeline = nums | std::views::filter([](int v) { return v % 2 == 0; }) |
                  std::views::transform([](int v) { return v * v; });
  for (int value : pipeline) {
    out.push_back(value);
  }
  return out;
}
