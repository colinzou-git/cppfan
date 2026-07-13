// Tests for backtracking-subsets. Build with -I _harness and the impl dir.
#include <vector>

#include "check.hpp"
#include "subsets.hpp"

using VV = std::vector<std::vector<int>>;

static void test_empty_input() {
  CHECK((subsets({}) == VV{{}}));
}

static void test_single() {
  CHECK((subsets({5}) == VV{{}, {5}}));
}

static void test_three() {
  VV expected{{}, {1}, {1, 2}, {1, 2, 3}, {1, 3}, {2}, {2, 3}, {3}};
  CHECK(subsets({1, 2, 3}) == expected);
}

static void test_unsorted_input_normalizes() {
  VV expected{{}, {1}, {1, 2}, {1, 2, 3}, {1, 3}, {2}, {2, 3}, {3}};
  CHECK(subsets({3, 1, 2}) == expected);
}

static void test_count_is_power_of_two() {
  CHECK(subsets({1, 2, 3, 4}).size() == 16);
}

int main() {
  test_empty_input();
  test_single();
  test_three();
  test_unsorted_input_normalizes();
  test_count_is_power_of_two();
  return REPORT();
}
