// Exercise: io-grade-calculator
// Compute a student's average of three scores and map it to a letter grade.
//
// Rules:
//  - `compute_grade(a, b, c)` returns a GradeResult with:
//      * average = (a + b + c) / 3.0 (a double; do not round it)
//      * letter  = 'A' for average >= 90, 'B' >= 80, 'C' >= 70, 'D' >= 60, else 'F'
//  - Use the thresholds inclusively (exactly 90.0 is an 'A').
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

struct GradeResult {
  double average;
  char letter;
};

inline GradeResult compute_grade(double a, double b, double c) {
  // TODO: compute the average, then map it to a letter grade from highest
  // threshold to lowest.
  (void)a;
  (void)b;
  (void)c;
  return {0.0, 'F'};
}
