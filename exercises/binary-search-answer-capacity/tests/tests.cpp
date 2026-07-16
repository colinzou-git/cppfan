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

// Invalid deadline: a shipment needs at least one day, so days <= 0 returns 0.
static void test_days_le_zero() {
  CHECK(min_capacity({1, 2, 3}, 0) == 0);
  CHECK(min_capacity({1, 2, 3}, -2) == 0);
}

// The total weight (and the answer) can exceed INT_MAX; the 64-bit contract must
// return the mathematically correct capacity without signed overflow.
static void test_total_exceeds_int_max() {
  // Sum = 4'000'000'000 > INT_MAX (2'147'483'647). One day => the full total.
  CHECK(min_capacity({2000000000, 2000000000}, 1) == 4000000000LL);
  // Two days => each package on its own day; the answer is the heaviest package.
  CHECK(min_capacity({2000000000, 2000000000}, 2) == 2000000000LL);
}

int main() {
  test_ten_packages_five_days();
  test_three_days();
  test_four_days();
  test_one_day_is_total();
  test_days_ge_packages_is_max();
  test_empty();
  test_days_le_zero();
  test_total_exceeds_int_max();
  return REPORT();
}
