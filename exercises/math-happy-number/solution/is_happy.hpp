// Reference solution for math-happy-number.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <unordered_set>

inline int square_digit_sum(int n) {
  int sum = 0;
  while (n > 0) {
    int d = n % 10;
    sum += d * d;
    n /= 10;
  }
  return sum;
}

inline bool is_happy(int n) {
  std::unordered_set<int> seen;
  while (n != 1 && seen.find(n) == seen.end()) {
    seen.insert(n);
    n = square_digit_sum(n);
  }
  return n == 1;
}
