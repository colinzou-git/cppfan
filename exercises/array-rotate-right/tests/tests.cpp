// Tests for array-rotate-right. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "rotate_right.hpp"

#include <vector>

static void test_basic() {
  CHECK(rotate_right(std::vector<int>{1, 2, 3, 4, 5}, 2) == (std::vector<int>{4, 5, 1, 2, 3}));
}

static void test_k_zero() {
  CHECK(rotate_right(std::vector<int>{1, 2, 3}, 0) == (std::vector<int>{1, 2, 3}));
}

static void test_k_wraps() {
  // k larger than n reduces modulo n: 7 % 3 == 1.
  CHECK(rotate_right(std::vector<int>{1, 2, 3}, 7) == (std::vector<int>{3, 1, 2}));
}

static void test_single() {
  CHECK(rotate_right(std::vector<int>{9}, 5) == (std::vector<int>{9}));
}

static void test_full_cycle() {
  CHECK(rotate_right(std::vector<int>{1, 2, 3, 4}, 4) == (std::vector<int>{1, 2, 3, 4}));
}

int main() {
  test_basic();
  test_k_zero();
  test_k_wraps();
  test_single();
  test_full_cycle();
  return REPORT();
}
