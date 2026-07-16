// Exercise: math-integer-sqrt
// Return floor(sqrt(x)) for a non-negative integer x: the largest r with
// r*r <= x. Use integer arithmetic only (no std::sqrt).
//
// Rules:
//  - `integer_sqrt(x)` returns the integer square root (floor).
//  - Binary search r in [0, x]; compare r*r to x with a 64-bit product.
//  - integer_sqrt(0) == 0, integer_sqrt(1) == 1.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

inline int integer_sqrt(int x) {
  // TODO: binary search the largest r such that (long long)r*r <= x.
  (void)x;
  return 0;
}
