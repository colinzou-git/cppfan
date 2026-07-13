// Tests for array-product-except-self. Build with -I _harness and impl dir.
#include <vector>

#include "check.hpp"
#include "product_except_self.hpp"

using V = std::vector<long long>;

static void test_basic() {
  CHECK((product_except_self({1, 2, 3, 4}) == V{24, 12, 8, 6}));
}

static void test_pair() {
  CHECK((product_except_self({2, 3}) == V{3, 2}));
}

static void test_single_zero() {
  CHECK((product_except_self({0, 4, 2}) == V{8, 0, 0}));
}

static void test_two_zeros() {
  CHECK((product_except_self({0, 0, 5}) == V{0, 0, 0}));
}

static void test_negatives() {
  CHECK((product_except_self({-1, 2, -3}) == V{-6, 3, -2}));
}

static void test_single_element() {
  CHECK((product_except_self({7}) == V{1}));
}

static void test_empty() {
  CHECK(product_except_self({}).empty());
}

int main() {
  test_basic();
  test_pair();
  test_single_zero();
  test_two_zeros();
  test_negatives();
  test_single_element();
  test_empty();
  return REPORT();
}
