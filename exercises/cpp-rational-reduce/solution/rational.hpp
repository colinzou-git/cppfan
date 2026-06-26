// Reference solution for cpp-rational-reduce.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

struct Rational {
  int num;
  int den;
};

inline int gcd_int(int a, int b) {
  if (a < 0) a = -a;
  if (b < 0) b = -b;
  while (b != 0) {
    const int t = a % b;
    a = b;
    b = t;
  }
  return a;
}

inline Rational reduce(int num, int den) {
  // Move the sign to the numerator so the denominator stays positive.
  if (den < 0) {
    num = -num;
    den = -den;
  }
  // gcd_int(0, den) == den, so a zero numerator reduces to 0/1.
  const int g = gcd_int(num, den);
  return {num / g, den / g};
}
