// Tests for dp-house-robber. Build with -I _harness and the impl dir.
#include <vector>

#include "check.hpp"
#include "house_robber.hpp"

static void test_basic() {
  CHECK(rob({1, 2, 3, 1}) == 4);  // houses 0 and 2
}

static void test_larger() {
  CHECK(rob({2, 7, 9, 3, 1}) == 12);  // 2 + 9 + 1
}

static void test_empty() {
  CHECK(rob({}) == 0);
}

static void test_single() {
  CHECK(rob({5}) == 5);
}

static void test_two() {
  CHECK(rob({2, 3}) == 3);
}

static void test_alternating_choice() {
  CHECK(rob({2, 1, 1, 2}) == 4);  // first and last
}

static void test_all_zero() {
  CHECK(rob({0, 0, 0}) == 0);
}

int main() {
  test_basic();
  test_larger();
  test_empty();
  test_single();
  test_two();
  test_alternating_choice();
  test_all_zero();
  return REPORT();
}
