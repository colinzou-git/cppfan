// Tests for matrix-spiral-order. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "spiral_order.hpp"

#include <vector>

using Matrix = std::vector<std::vector<int>>;

static void test_square() {
  CHECK(spiral_order(Matrix{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}) ==
        (std::vector<int>{1, 2, 3, 6, 9, 8, 7, 4, 5}));
}

static void test_rectangular() {
  CHECK(spiral_order(Matrix{{1, 2, 3, 4}, {5, 6, 7, 8}, {9, 10, 11, 12}}) ==
        (std::vector<int>{1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7}));
}

static void test_single_row() {
  CHECK(spiral_order(Matrix{{1, 2, 3}}) == (std::vector<int>{1, 2, 3}));
}

static void test_single_column() {
  CHECK(spiral_order(Matrix{{1}, {2}, {3}}) == (std::vector<int>{1, 2, 3}));
}

static void test_empty() {
  CHECK(spiral_order(Matrix{}) == std::vector<int>{});
  CHECK(spiral_order(Matrix{{}}) == std::vector<int>{});
}

int main() {
  test_square();
  test_rectangular();
  test_single_row();
  test_single_column();
  test_empty();
  return REPORT();
}
