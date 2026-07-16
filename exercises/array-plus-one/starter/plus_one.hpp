// Exercise: array-plus-one
// The input is a non-negative integer stored one decimal digit per element, most
// significant digit first (e.g. {1, 2, 9} is 129). Return the digits of the
// number plus one (e.g. {1, 3, 0}).
//
// Rules:
//  - `plus_one(digits)` returns the digit array of the incremented number.
//  - Each element is 0..9; the leading digit is non-zero unless the number is 0.
//  - Propagate a carry right-to-left; if it survives, prepend a 1.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline std::vector<int> plus_one(std::vector<int> digits) {
  // TODO: add one to the last digit and carry left; prepend 1 if needed.
  return digits;
}
