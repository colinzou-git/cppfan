// Exercise: bit-missing-number
// The array holds n distinct integers taken from the range 0..n (inclusive),
// so exactly one value in that range is missing. Return the missing value.
//
// Rules:
//  - `missing_number(nums)` returns the one value in 0..n not present in nums.
//  - Target O(n) time, O(1) extra space.
//  - XOR is the key: x ^ x == 0 and x ^ 0 == x. XOR every index 0..n with every
//    value; the paired numbers cancel and the missing one remains.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline int missing_number(const std::vector<int>& nums) {
  // TODO: fold indices 0..n and the values together with XOR, then return it.
  (void)nums;
  return 0;
}
