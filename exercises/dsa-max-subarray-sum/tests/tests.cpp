// Tests for dsa-max-subarray-sum. Build with -I _harness and the impl dir.
#include <vector>

#include "check.hpp"
#include "max_subarray.hpp"

static void test_mixed() {
  // [4, -1, 2, 1] sums to 6.
  std::vector<int> nums{-2, 1, -3, 4, -1, 2, 1, -5, 4};
  CHECK(max_subarray_sum(nums) == 6);
}

static void test_all_positive() {
  std::vector<int> nums{1, 2, 3, 4};
  CHECK(max_subarray_sum(nums) == 10);
}

static void test_all_negative() {
  std::vector<int> nums{-8, -3, -6, -2, -5};
  CHECK(max_subarray_sum(nums) == -2);  // the largest single element
}

static void test_single_element() {
  CHECK(max_subarray_sum(std::vector<int>{7}) == 7);
  CHECK(max_subarray_sum(std::vector<int>{-7}) == -7);
}

static void test_large_values_no_overflow() {
  // Sum exceeds 32-bit range: 3 * 2,000,000,000 = 6,000,000,000.
  std::vector<int> nums{2000000000, 2000000000, 2000000000};
  CHECK(max_subarray_sum(nums) == 6000000000LL);
}

int main() {
  test_mixed();
  test_all_positive();
  test_all_negative();
  test_single_element();
  test_large_values_no_overflow();
  return REPORT();
}
