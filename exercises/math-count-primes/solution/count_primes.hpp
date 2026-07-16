// Reference solution for math-count-primes.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

inline int count_primes(int n) {
  if (n <= 2) {
    return 0;
  }
  std::vector<char> is_prime(n, true);
  is_prime[0] = is_prime[1] = false;
  for (long long p = 2; p * p < n; ++p) {
    if (is_prime[static_cast<int>(p)]) {
      for (long long m = p * p; m < n; m += p) {
        is_prime[static_cast<int>(m)] = false;
      }
    }
  }
  int count = 0;
  for (int i = 2; i < n; ++i) {
    if (is_prime[i]) {
      ++count;
    }
  }
  return count;
}
