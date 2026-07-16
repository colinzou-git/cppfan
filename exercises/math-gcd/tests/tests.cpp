// Tests for math-gcd. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "gcd.hpp"

static void test_coprime() {
  CHECK(gcd(13, 7) == 1);
  CHECK(gcd(9, 28) == 1);
}

static void test_common_factor() {
  CHECK(gcd(12, 18) == 6);
  CHECK(gcd(48, 36) == 12);
}

static void test_multiple() {
  CHECK(gcd(15, 5) == 5);   // one divides the other
  CHECK(gcd(100, 25) == 25);
}

static void test_with_zero() {
  CHECK(gcd(7, 0) == 7);
  CHECK(gcd(0, 9) == 9);
}

static void test_equal() {
  CHECK(gcd(6, 6) == 6);
}

int main() {
  test_coprime();
  test_common_factor();
  test_multiple();
  test_with_zero();
  test_equal();
  return REPORT();
}
