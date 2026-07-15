// Tests for bit-single-number. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "single_number.hpp"

#include <vector>

static void test_single() {
  CHECK(single_number(std::vector<int>{42}) == 42);
}

static void test_all_but_one_paired() {
  CHECK(single_number(std::vector<int>{2, 2, 1}) == 1);
  CHECK(single_number(std::vector<int>{4, 1, 2, 1, 2}) == 4);
}

static void test_negatives() {
  CHECK(single_number(std::vector<int>{-3, -3, -7}) == -7);
  CHECK(single_number(std::vector<int>{5, -5, 5}) == -5);
}

static void test_order_independent() {
  CHECK(single_number(std::vector<int>{7, 3, 3, 9, 7}) == 9);
  CHECK(single_number(std::vector<int>{9, 7, 3, 7, 3}) == 9);
}

static void test_large() {
  CHECK(single_number(std::vector<int>{1000000, 1, 1000000, 2, 2}) == 1);
}

int main() {
  test_single();
  test_all_but_one_paired();
  test_negatives();
  test_order_independent();
  test_large();
  return REPORT();
}
