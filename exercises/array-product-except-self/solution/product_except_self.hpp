// Reference solution for array-product-except-self.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

// result[i] = product of every nums[j] with j != i. No division; O(n).
inline std::vector<long long> product_except_self(const std::vector<int>& nums) {
  const std::size_t n = nums.size();
  std::vector<long long> result(n, 1);
  long long prefix = 1;
  for (std::size_t i = 0; i < n; ++i) {
    result[i] = prefix;
    prefix *= nums[i];
  }
  long long suffix = 1;
  for (std::size_t i = n; i-- > 0;) {
    result[i] *= suffix;
    suffix *= nums[i];
  }
  return result;
}
