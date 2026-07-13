// Exercise: ranges-filter-transform
// Build a small range pipeline: keep even numbers, then square them.
//
// Rules:
//  - Return a vector containing the squares of the even inputs, in the original
//    order.
//  - Compose std::views::filter and std::views::transform (a C++20 ranges
//    pipeline with the | operator), then collect into a vector.
//  - Empty input (or no evens) yields an empty vector.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <ranges>
#include <vector>

inline std::vector<int> even_squares(const std::vector<int>& nums) {
  // TODO: nums | filter(even) | transform(square), then push each into out.
  (void)nums;
  return {};
}
