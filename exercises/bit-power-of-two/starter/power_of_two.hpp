// Exercise: bit-power-of-two
// Return whether a given integer is a power of two (1, 2, 4, 8, ...).
//
// Rules:
//  - `is_power_of_two(n)` returns true iff n is a positive power of two.
//  - Zero and negative numbers are never powers of two.
//  - The bit trick: for n > 0, `n & (n - 1)` clears the lowest set bit and is
//    zero exactly when n had a single set bit.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

inline bool is_power_of_two(int n) {
  // TODO: return true iff n > 0 and n has exactly one set bit.
  (void)n;
  return false;
}
