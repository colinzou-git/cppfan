// Reference solution for math-gcd.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

inline int gcd(int a, int b) {
  while (b != 0) {
    int r = a % b;
    a = b;
    b = r;
  }
  return a;
}
