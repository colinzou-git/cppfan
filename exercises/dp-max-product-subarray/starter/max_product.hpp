// Exercise: dp-max-product-subarray
// Return the largest product of any contiguous non-empty subarray.
//
// Rules:
//  - `max_product(nums)` returns the maximum subarray product.
//  - Negatives flip max/min, so track BOTH the running max and min product.
//  - new_max = max(x, x*max, x*min); new_min = min(x, x*max, x*min).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline int max_product(const std::vector<int>& nums) {
  // TODO: carry running max/min products; return the best max seen.
  (void)nums;
  return 0;
}
