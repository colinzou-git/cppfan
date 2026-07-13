// Exercise: math-fast-power-mod
// Compute (base^exp) mod m efficiently with binary exponentiation.
//
// Rules:
//  - Preconditions: exp >= 0 and m >= 1.
//  - Return a value in [0, m). When m == 1 the answer is 0.
//  - Run in O(log exp): square the base and halve the exponent each step.
//  - Guard the multiply against overflow (e.g. cast to __int128 before % m).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

inline long long power_mod(long long base, long long exp, long long m) {
  // TODO: binary exponentiation with a modulus.
  (void)base;
  (void)exp;
  (void)m;
  return 0;
}
