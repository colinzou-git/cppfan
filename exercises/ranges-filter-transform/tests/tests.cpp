// Tests for ranges-filter-transform. Build with -I _harness and the impl dir.
#include <vector>

#include "check.hpp"
#include "ranges_pipeline.hpp"

using V = std::vector<int>;

static void test_mixed() {
  CHECK((even_squares({1, 2, 3, 4}) == V{4, 16}));
}

static void test_all_even() {
  CHECK((even_squares({2, 4, 6}) == V{4, 16, 36}));
}

static void test_no_evens() {
  CHECK(even_squares({1, 3, 5}).empty());
}

static void test_empty() {
  CHECK(even_squares({}).empty());
}

static void test_negatives_and_zero() {
  CHECK((even_squares({-2, -3, 0, 5}) == V{4, 0}));
}

static void test_preserves_order() {
  CHECK((even_squares({6, 1, 2, 3, 4}) == V{36, 4, 16}));
}

int main() {
  test_mixed();
  test_all_even();
  test_no_evens();
  test_empty();
  test_negatives_and_zero();
  test_preserves_order();
  return REPORT();
}
