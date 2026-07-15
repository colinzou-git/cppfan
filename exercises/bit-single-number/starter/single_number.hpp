// Exercise: bit-single-number
// Every value appears exactly twice except one, which appears once. Return it.
//
// Rules:
//  - `single_number(nums)` returns the value that appears exactly once.
//  - Target O(n) time, O(1) extra space.
//  - XOR is the key: x ^ x == 0 and x ^ 0 == x, so XOR-ing the whole array
//    cancels every paired value and leaves the unique one.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline int single_number(const std::vector<int>& nums) {
  // TODO: fold the array with XOR (start from 0) and return the accumulator.
  (void)nums;
  return 0;
}
