// Reference solution for dp-max-product-subarray.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <cstddef>
#include <vector>

inline int max_product(const std::vector<int>& nums) {
  int best = nums[0];
  int cur_max = nums[0];
  int cur_min = nums[0];
  for (std::size_t i = 1; i < nums.size(); ++i) {
    int x = nums[i];
    int a = x;
    int b = x * cur_max;
    int c = x * cur_min;
    cur_max = std::max({a, b, c});
    cur_min = std::min({a, b, c});
    best = std::max(best, cur_max);
  }
  return best;
}
