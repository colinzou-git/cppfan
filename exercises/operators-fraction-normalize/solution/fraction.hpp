// Reference solution for operators-fraction-normalize.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <cstdlib>
#include <numeric>
#include <ostream>

struct Fraction {
  long long num;
  long long den;

  // Precondition: d != 0. Always stored in lowest terms with den > 0.
  Fraction(long long n = 0, long long d = 1) : num(n), den(d) {
    if (den < 0) {
      num = -num;
      den = -den;
    }
    const long long g = std::gcd(num < 0 ? -num : num, den);
    if (g != 0) {
      num /= g;
      den /= g;
    }
  }
};

inline Fraction operator+(const Fraction& a, const Fraction& b) {
  return Fraction(a.num * b.den + b.num * a.den, a.den * b.den);
}

inline bool operator==(const Fraction& a, const Fraction& b) {
  return a.num == b.num && a.den == b.den;
}

inline std::ostream& operator<<(std::ostream& os, const Fraction& f) {
  return os << f.num << "/" << f.den;
}
