// Tests for constructors-student-record. Build with -I _harness and the impl dir.
#include <cmath>
#include <string>

#include "check.hpp"
#include "student.hpp"

static bool close(double a, double b) {
  return std::fabs(a - b) < 1e-9;
}

static void test_default_constructor() {
  Student s;
  CHECK(s.name() == "");
  CHECK(s.id() == 0);
  CHECK(close(s.gpa(), 0.0));
}

static void test_parameterized_constructor() {
  Student s("Ada", 42, 3.9);
  CHECK(s.name() == "Ada");
  CHECK(s.id() == 42);
  CHECK(close(s.gpa(), 3.9));
}

static void test_negative_id_clamps() {
  Student s("Bo", -7, 2.0);
  CHECK(s.id() == 0);
}

static void test_gpa_clamps_high() {
  Student s("Cy", 1, 4.7);
  CHECK(close(s.gpa(), 4.0));
}

static void test_gpa_clamps_low() {
  Student s("Di", 2, -1.5);
  CHECK(close(s.gpa(), 0.0));
}

static void test_honor_roll_threshold() {
  CHECK(Student("Ed", 3, 3.5).is_honor_roll());
  CHECK(Student("Fi", 4, 3.9).is_honor_roll());
  CHECK(!Student("Gu", 5, 3.49).is_honor_roll());
}

int main() {
  test_default_constructor();
  test_parameterized_constructor();
  test_negative_id_clamps();
  test_gpa_clamps_high();
  test_gpa_clamps_low();
  test_honor_roll_threshold();
  return REPORT();
}
