// Tests for cpp-rational-reduce. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "rational.hpp"

static void test_basic_reduction() {
  const Rational r = reduce(2, 4);
  CHECK(r.num == 1 && r.den == 2);
}

static void test_already_reduced() {
  const Rational r = reduce(7, 1);
  CHECK(r.num == 7 && r.den == 1);
  const Rational s = reduce(3, 5);
  CHECK(s.num == 3 && s.den == 5);
}

static void test_negative_numerator() {
  const Rational r = reduce(-2, 4);
  CHECK(r.num == -1 && r.den == 2);
}

static void test_negative_denominator_moves_sign() {
  const Rational r = reduce(2, -4);
  CHECK(r.num == -1 && r.den == 2);
}

static void test_both_negative_is_positive() {
  const Rational r = reduce(-6, -4);
  CHECK(r.num == 3 && r.den == 2);
}

static void test_zero_numerator() {
  const Rational r = reduce(0, 5);
  CHECK(r.num == 0 && r.den == 1);
}

static void test_reduces_to_integer() {
  const Rational r = reduce(6, 3);
  CHECK(r.num == 2 && r.den == 1);
}

int main() {
  test_basic_reduction();
  test_already_reduced();
  test_negative_numerator();
  test_negative_denominator_moves_sign();
  test_both_negative_is_positive();
  test_zero_numerator();
  test_reduces_to_integer();
  return REPORT();
}
