// Exercise: operators-fraction-normalize
// Build a Fraction type that keeps itself normalized and overloads the +, ==,
// and << operators.
//
// Rules (precondition: the denominator is never 0):
//  - The constructor stores the fraction in lowest terms, with the sign carried
//    by the numerator and den > 0. Examples: 2/4 -> 1/2, 1/-2 -> -1/2,
//    -3/-6 -> 1/2, 0/5 -> 0/1.
//  - operator+ adds two fractions and returns a normalized result.
//  - operator== compares two fractions for equality (equal once normalized).
//  - operator<< prints "num/den" (e.g. 3/4).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <numeric>
#include <ostream>

struct Fraction {
  long long num;
  long long den;

  Fraction(long long n = 0, long long d = 1) : num(n), den(d) {
    // TODO: move the sign onto the numerator (den > 0), then divide both by
    // gcd(|num|, den) so the fraction is in lowest terms.
  }
};

inline Fraction operator+(const Fraction& a, const Fraction& b) {
  // TODO: common denominator, then construct a normalized Fraction.
  (void)a;
  (void)b;
  return Fraction();
}

inline bool operator==(const Fraction& a, const Fraction& b) {
  // TODO: normalized fractions are equal when both fields match.
  (void)a;
  (void)b;
  return false;
}

inline std::ostream& operator<<(std::ostream& os, const Fraction& f) {
  // TODO: print "num/den".
  (void)f;
  return os;
}
