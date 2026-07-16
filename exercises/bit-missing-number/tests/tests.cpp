// Tests for bit-missing-number. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "missing_number.hpp"

#include <vector>

static void test_missing_middle() {
  CHECK(missing_number(std::vector<int>{3, 0, 1}) == 2);
  CHECK(missing_number(std::vector<int>{0, 1, 3, 4}) == 2);
}

static void test_missing_zero() {
  CHECK(missing_number(std::vector<int>{1, 2, 3}) == 0);
}

static void test_missing_last() {
  CHECK(missing_number(std::vector<int>{0, 1, 2}) == 3);
}

static void test_single() {
  CHECK(missing_number(std::vector<int>{0}) == 1);
  CHECK(missing_number(std::vector<int>{1}) == 0);
}

static void test_large() {
  CHECK(missing_number(std::vector<int>{9, 6, 4, 2, 3, 5, 7, 0, 1}) == 8);
}

int main() {
  test_missing_middle();
  test_missing_zero();
  test_missing_last();
  test_single();
  test_large();
  return REPORT();
}
