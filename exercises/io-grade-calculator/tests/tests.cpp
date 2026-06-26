// Tests for io-grade-calculator. Build with -I _harness and the implementation dir.
#include <cmath>

#include "check.hpp"
#include "grade_calculator.hpp"

static bool near(double x, double y) { return std::fabs(x - y) < 1e-9; }

static void test_letter_a() {
  const GradeResult r = compute_grade(95.0, 90.0, 100.0);
  CHECK(near(r.average, 95.0));
  CHECK(r.letter == 'A');
}

static void test_boundary_b() {
  const GradeResult r = compute_grade(80.0, 80.0, 80.0);
  CHECK(near(r.average, 80.0));
  CHECK(r.letter == 'B');
}

static void test_boundary_d() {
  const GradeResult r = compute_grade(60.0, 60.0, 60.0);
  CHECK(r.letter == 'D');
}

static void test_letter_f() {
  const GradeResult r = compute_grade(50.0, 50.0, 50.0);
  CHECK(r.letter == 'F');
}

static void test_exact_ninety_is_a() {
  // (89 + 90 + 91) / 3 == 90 exactly -> 'A' (inclusive threshold).
  const GradeResult r = compute_grade(89.0, 90.0, 91.0);
  CHECK(near(r.average, 90.0));
  CHECK(r.letter == 'A');
}

static void test_just_below_sixty_is_f() {
  // Average 59.9 -> 'F'.
  const GradeResult r = compute_grade(59.9, 59.9, 59.9);
  CHECK(r.average < 60.0);
  CHECK(r.letter == 'F');
}

static void test_decimal_scores() {
  const GradeResult r = compute_grade(70.5, 75.0, 80.5);
  CHECK(near(r.average, (70.5 + 75.0 + 80.5) / 3.0));
  CHECK(r.letter == 'C');
}

int main() {
  test_letter_a();
  test_boundary_b();
  test_boundary_d();
  test_letter_f();
  test_exact_ninety_is_a();
  test_just_below_sixty_is_f();
  test_decimal_scores();
  return REPORT();
}
