// Tests for sliding-window-min-size-subarray. Build with -I _harness and impl dir.
#include <vector>

#include "check.hpp"
#include "min_subarray.hpp"

static void test_basic() {
  CHECK(min_subarray_len(7, {2, 3, 1, 2, 4, 3}) == 2);  // [4,3]
}

static void test_whole_array() {
  CHECK(min_subarray_len(11, {1, 2, 3, 4, 5}) == 3);  // [3,4,5]
}

static void test_no_solution() {
  CHECK(min_subarray_len(100, {1, 2, 3}) == 0);
}

static void test_single_element_suffices() {
  CHECK(min_subarray_len(4, {1, 4, 4}) == 1);
}

static void test_exact_sum() {
  CHECK(min_subarray_len(6, {1, 2, 3}) == 3);
}

static void test_empty() {
  CHECK(min_subarray_len(5, {}) == 0);
}

int main() {
  test_basic();
  test_whole_array();
  test_no_solution();
  test_single_element_suffices();
  test_exact_sum();
  test_empty();
  return REPORT();
}
