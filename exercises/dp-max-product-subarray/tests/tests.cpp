// Tests for dp-max-product-subarray. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "max_product.hpp"

#include <vector>

static void test_basic() {
  CHECK(max_product(std::vector<int>{2, 3, -2, 4}) == 6);  // [2,3]
}

static void test_negatives() {
  CHECK(max_product(std::vector<int>{-2, 3, -4}) == 24);  // whole array
}

static void test_zero() {
  CHECK(max_product(std::vector<int>{-2, 0, -1}) == 0);
  CHECK(max_product(std::vector<int>{0, 2}) == 2);
}

static void test_single() {
  CHECK(max_product(std::vector<int>{-3}) == -3);
  CHECK(max_product(std::vector<int>{5}) == 5);
}

static void test_all_negative() {
  CHECK(max_product(std::vector<int>{-1, -3, -10, -2}) == 60);  // [-3,-10,-2]
}

int main() {
  test_basic();
  test_negatives();
  test_zero();
  test_single();
  test_all_negative();
  return REPORT();
}
