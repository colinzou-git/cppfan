// Tests for dsa-binary-search-lower-bound. Build with -I _harness and impl dir.
#include <vector>

#include "check.hpp"
#include "lower_bound.hpp"

static void test_present_unique() {
  std::vector<int> nums{1, 3, 5, 7, 9};
  CHECK(lower_bound_index(nums, 5) == 2);
  CHECK(lower_bound_index(nums, 1) == 0);
  CHECK(lower_bound_index(nums, 9) == 4);
}

static void test_absent_between() {
  std::vector<int> nums{1, 3, 5, 7, 9};
  CHECK(lower_bound_index(nums, 4) == 2);  // first >= 4 is 5 at index 2
  CHECK(lower_bound_index(nums, 0) == 0);  // before everything
}

static void test_above_all() {
  std::vector<int> nums{1, 3, 5};
  CHECK(lower_bound_index(nums, 10) == 3);  // size, insert at end
}

static void test_duplicates_first_match() {
  std::vector<int> nums{2, 2, 2, 4, 4};
  CHECK(lower_bound_index(nums, 2) == 0);  // first of the 2s
  CHECK(lower_bound_index(nums, 4) == 3);  // first of the 4s
  CHECK(lower_bound_index(nums, 3) == 3);  // between
}

static void test_empty() {
  std::vector<int> nums{};
  CHECK(lower_bound_index(nums, 5) == 0);
}

int main() {
  test_present_unique();
  test_absent_between();
  test_above_all();
  test_duplicates_first_match();
  test_empty();
  return REPORT();
}
