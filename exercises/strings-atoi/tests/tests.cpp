// Tests for strings-atoi. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "str_to_int.hpp"

#include <string>

static void test_basic() {
  CHECK(str_to_int("42") == 42);
  CHECK(str_to_int("+1") == 1);
  CHECK(str_to_int("0") == 0);
}

static void test_leading_spaces() {
  CHECK(str_to_int("   -42") == -42);
  CHECK(str_to_int("   123") == 123);
}

static void test_trailing_junk() {
  CHECK(str_to_int("4193 with words") == 4193);
  CHECK(str_to_int("42abc") == 42);
}

static void test_no_digits() {
  CHECK(str_to_int("words and 987") == 0);
  CHECK(str_to_int("") == 0);
  CHECK(str_to_int("+-12") == 0);
}

static void test_overflow() {
  CHECK(str_to_int("2147483648") == 2147483647);
  CHECK(str_to_int("-2147483649") == -2147483648);
  CHECK(str_to_int("99999999999") == 2147483647);
}

int main() {
  test_basic();
  test_leading_spaces();
  test_trailing_junk();
  test_no_digits();
  test_overflow();
  return REPORT();
}
