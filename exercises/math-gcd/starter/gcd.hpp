// Exercise: math-gcd
// Return the greatest common divisor of two non-negative integers using
// Euclid's algorithm.
//
// Rules:
//  - `gcd(a, b)` returns the largest integer dividing both a and b.
//  - Euclid: gcd(a, b) == gcd(b, a % b); stop when the second value is 0.
//  - gcd(x, 0) == x. Both inputs are non-negative and not both zero.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

inline int gcd(int a, int b) {
  // TODO: loop replacing (a, b) with (b, a % b) until b == 0; return a.
  (void)a;
  (void)b;
  return 0;
}
