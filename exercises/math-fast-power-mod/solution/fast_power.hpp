// Reference solution for math-fast-power-mod.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

// (base^exp) mod m by binary exponentiation. Preconditions: exp >= 0, m >= 1.
// Uses __int128 for the intermediate product so large moduli do not overflow.
inline long long power_mod(long long base, long long exp, long long m) {
  if (m == 1) {
    return 0;
  }
  long long result = 1;
  long long b = base % m;
  if (b < 0) {
    b += m;
  }
  while (exp > 0) {
    if (exp & 1) {
      result = static_cast<long long>((static_cast<__int128>(result) * b) % m);
    }
    b = static_cast<long long>((static_cast<__int128>(b) * b) % m);
    exp >>= 1;
  }
  return result;
}
