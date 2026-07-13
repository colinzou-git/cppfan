// Tests for binary-search-answer-capacity. Build with -I _harness and impl dir.
#include <vector>

#include "check.hpp"
#include "min_capacity.hpp"

static void test_ten_packages_five_days() {
  CHECK(min_capacity({1, 2, 3, 4, 5, 6, 7, 8, 9, 10}, 5) == 15);
}

static void test_three_days() {
  CHECK(min_capacity({3, 2, 2, 4, 1, 4}, 3) == 6);
}

static void test_four_days() {
  CHECK(min_capacity({1, 2, 3, 1, 1}, 4) == 3);
}

static void test_one_day_is_total() {
  CHECK(min_capacity({1, 2, 3, 4, 5}, 1) == 15);
}

static void test_days_ge_packages_is_max() {
  CHECK(min_capacity({4, 2, 7, 1}, 10) == 7);
}

static void test_empty() {
  CHECK(min_capacity({}, 3) == 0);
}

int main() {
  test_ten_packages_five_days();
  test_three_days();
  test_four_days();
  test_one_day_is_total();
  test_days_ge_packages_is_max();
  test_empty();
  return REPORT();
}
