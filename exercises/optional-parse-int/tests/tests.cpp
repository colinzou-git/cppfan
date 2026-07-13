// Tests for optional-parse-int. Build with -I _harness and the impl dir.
#include <optional>
#include <string>

#include "check.hpp"
#include "parse_int.hpp"

static void test_positive() {
  auto r = parse_int("42");
  CHECK(r.has_value() && *r == 42);
}

static void test_negative() {
  auto r = parse_int("-7");
  CHECK(r.has_value() && *r == -7);
}

static void test_leading_plus() {
  auto r = parse_int("+3");
  CHECK(r.has_value() && *r == 3);
}

static void test_empty_is_nullopt() {
  CHECK(!parse_int("").has_value());
  CHECK(!parse_int("+").has_value());
}

static void test_trailing_garbage() {
  CHECK(!parse_int("12a").has_value());
  CHECK(!parse_int("3.5").has_value());
}

static void test_surrounding_space() {
  CHECK(!parse_int("  5").has_value());
  CHECK(!parse_int("5 ").has_value());
}

static void test_non_numeric() {
  CHECK(!parse_int("abc").has_value());
}

static void test_overflow() {
  CHECK(!parse_int("2147483648").has_value());  // INT_MAX + 1
  auto ok = parse_int("2147483647");
  CHECK(ok.has_value() && *ok == 2147483647);
}

int main() {
  test_positive();
  test_negative();
  test_leading_plus();
  test_empty_is_nullopt();
  test_trailing_garbage();
  test_surrounding_space();
  test_non_numeric();
  test_overflow();
  return REPORT();
}
