// Tests for operators-fraction-normalize. Build with -I _harness and the impl dir.
#include <sstream>
#include <string>

#include "check.hpp"
#include "fraction.hpp"

static void test_constructor_reduces() {
  Fraction f(2, 4);
  CHECK(f.num == 1 && f.den == 2);
}

static void test_sign_moves_to_numerator() {
  Fraction f(1, -2);
  CHECK(f.num == -1 && f.den == 2);
}

static void test_both_negative_is_positive() {
  Fraction f(-3, -6);
  CHECK(f.num == 1 && f.den == 2);
}

static void test_zero_normalizes() {
  Fraction f(0, 5);
  CHECK(f.num == 0 && f.den == 1);
}

static void test_addition() {
  Fraction sum = Fraction(1, 2) + Fraction(1, 3);
  CHECK(sum.num == 5 && sum.den == 6);
}

static void test_addition_reduces() {
  Fraction sum = Fraction(1, 6) + Fraction(1, 6);
  CHECK(sum.num == 1 && sum.den == 3);
}

static void test_equality() {
  CHECK(Fraction(2, 4) == Fraction(1, 2));
  CHECK(!(Fraction(1, 2) == Fraction(1, 3)));
}

static void test_stream_insertion() {
  std::ostringstream os;
  os << Fraction(6, 8);
  CHECK(os.str() == "3/4");
}

int main() {
  test_constructor_reduces();
  test_sign_moves_to_numerator();
  test_both_negative_is_positive();
  test_zero_normalizes();
  test_addition();
  test_addition_reduces();
  test_equality();
  test_stream_insertion();
  return REPORT();
}
