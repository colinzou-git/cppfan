// Exercise: bit-single-number-ii
// Every value in `nums` appears exactly three times except one, which appears
// once. Return that single value.
//
// Rules:
//  - Plain XOR does NOT work here (three copies do not cancel).
//  - Count set bits per position across all values; tripled numbers contribute
//    a multiple of 3 to each position.
//  - A bit whose total count is not divisible by 3 belongs to the answer.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline int single_number(const std::vector<int>& nums) {
  // TODO: for each of the 32 bit positions, sum the set bits mod 3.
  (void)nums;
  return 0;
}
