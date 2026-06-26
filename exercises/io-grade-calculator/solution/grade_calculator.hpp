// Reference solution for io-grade-calculator.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

struct GradeResult {
  double average;
  char letter;
};

inline char letter_for(double average) {
  if (average >= 90.0) return 'A';
  if (average >= 80.0) return 'B';
  if (average >= 70.0) return 'C';
  if (average >= 60.0) return 'D';
  return 'F';
}

inline GradeResult compute_grade(double a, double b, double c) {
  const double average = (a + b + c) / 3.0;
  return {average, letter_for(average)};
}
