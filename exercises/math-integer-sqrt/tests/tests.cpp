// Tests for math-integer-sqrt. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "integer_sqrt.hpp"

static void test_perfect_squares() {
  CHECK(integer_sqrt(4) == 2);
  CHECK(integer_sqrt(9) == 3);
  CHECK(integer_sqrt(144) == 12);
}

static void test_non_squares() {
  CHECK(integer_sqrt(8) == 2);    // floor(2.82...)
  CHECK(integer_sqrt(15) == 3);
  CHECK(integer_sqrt(80) == 8);   // 9*9 = 81 > 80
}

static void test_zero_one() {
  CHECK(integer_sqrt(0) == 0);
  CHECK(integer_sqrt(1) == 1);
  CHECK(integer_sqrt(2) == 1);
  CHECK(integer_sqrt(3) == 1);
}

static void test_large() {
  CHECK(integer_sqrt(2147395600) == 46340);       // 46340^2 = 2147395600
  CHECK(integer_sqrt(2147483647) == 46340);        // INT_MAX
}

static void test_boundary() {
  CHECK(integer_sqrt(15) == 3);
  CHECK(integer_sqrt(16) == 4);
  CHECK(integer_sqrt(17) == 4);
}

int main() {
  test_perfect_squares();
  test_non_squares();
  test_zero_one();
  test_large();
  test_boundary();
  return REPORT();
}
