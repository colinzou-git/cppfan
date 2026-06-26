// Exercise: cpp-rational-reduce
// Reduce a fraction to its canonical lowest-terms form.
//
// Rules:
//  - `reduce(num, den)` returns a Rational in lowest terms (numerator and
//    denominator share no common factor besides 1).
//  - The denominator is always positive in the result; move any sign to the
//    numerator (so reduce(2, -4) is {-1, 2}).
//  - `0/d` reduces to `{0, 1}`.
//  - `den` is never 0.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

struct Rational {
  int num;
  int den;
};

inline Rational reduce(int num, int den) {
  // TODO: normalize the sign onto the numerator, then divide both by their
  // greatest common divisor.
  (void)num;
  (void)den;
  return {0, 1};
}
