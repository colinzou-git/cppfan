// Exercise: math-happy-number
// A number is "happy" if repeatedly replacing it with the sum of the squares of
// its digits eventually reaches 1. If the process loops without reaching 1, the
// number is not happy.
//
// Rules:
//  - `is_happy(n)` returns whether n is happy (n >= 1).
//  - Sum the squares of the decimal digits each step.
//  - Detect the loop with a visited set or Floyd's cycle detection.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

inline bool is_happy(int n) {
  // TODO: iterate the square-digit-sum; return true if it reaches 1, false on a cycle.
  (void)n;
  return false;
}
