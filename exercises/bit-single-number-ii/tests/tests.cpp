// Tests for bit-single-number-ii. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "single_number.hpp"

#include <vector>

static void test_basic() {
  CHECK(single_number(std::vector<int>{2, 2, 3, 2}) == 3);
}

static void test_bigger() {
  CHECK(single_number(std::vector<int>{0, 1, 0, 1, 0, 1, 99}) == 99);
}

static void test_negatives() {
  CHECK(single_number(std::vector<int>{-2, -2, -2, 5}) == 5);
  CHECK(single_number(std::vector<int>{4, 4, 4, -9}) == -9);
  CHECK(single_number(std::vector<int>{-7, 8, 8, 8, -7, -7, -5}) == -5);
}

static void test_single() {
  CHECK(single_number(std::vector<int>{7}) == 7);
}

static void test_order_independent() {
  CHECK(single_number(std::vector<int>{3, 5, 3, 5, 5, 3, 8}) == 8);
  CHECK(single_number(std::vector<int>{8, 5, 3, 5, 3, 5, 3}) == 8);
}

int main() {
  test_basic();
  test_bigger();
  test_negatives();
  test_single();
  test_order_independent();
  return REPORT();
}
