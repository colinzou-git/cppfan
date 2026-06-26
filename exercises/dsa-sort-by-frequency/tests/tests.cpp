// Tests for dsa-sort-by-frequency. Build with -I _harness and the impl dir.
#include <vector>

#include "check.hpp"
#include "sort_by_frequency.hpp"

static void test_basic() {
  const std::vector<int> r = sort_by_frequency({1, 1, 2, 2, 2, 3});
  CHECK((r == std::vector<int>{3, 1, 1, 2, 2, 2}));
}

static void test_all_same_frequency_orders_by_value() {
  const std::vector<int> r = sort_by_frequency({3, 1, 2});
  CHECK((r == std::vector<int>{1, 2, 3}));
}

static void test_ties_broken_by_value() {
  // 2 and 3 both appear twice -> 2 before 3; 1 appears once -> first.
  const std::vector<int> r = sort_by_frequency({3, 3, 2, 2, 1});
  CHECK((r == std::vector<int>{1, 2, 2, 3, 3}));
}

static void test_empty_and_single() {
  CHECK(sort_by_frequency({}).empty());
  CHECK((sort_by_frequency({5}) == std::vector<int>{5}));
}

static void test_negatives() {
  const std::vector<int> r = sort_by_frequency({-1, -1, 0});
  CHECK((r == std::vector<int>{0, -1, -1}));
}

int main() {
  test_basic();
  test_all_same_frequency_orders_by_value();
  test_ties_broken_by_value();
  test_empty_and_single();
  test_negatives();
  return REPORT();
}
