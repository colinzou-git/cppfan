// Tests for dsa-move-zeroes. Build with -I _harness and the impl dir.
#include <vector>

#include "check.hpp"
#include "move_zeroes.hpp"

static void test_basic() {
  CHECK((move_zeroes({0, 1, 0, 3, 12}) == std::vector<int>{1, 3, 12, 0, 0}));
}

static void test_no_zeroes() {
  CHECK((move_zeroes({1, 2, 3}) == std::vector<int>{1, 2, 3}));
}

static void test_all_zeroes() {
  CHECK((move_zeroes({0, 0, 0}) == std::vector<int>{0, 0, 0}));
}

static void test_preserves_order() {
  CHECK((move_zeroes({4, 0, 5, 0, 0, 6}) == std::vector<int>{4, 5, 6, 0, 0, 0}));
}

static void test_empty_and_single() {
  CHECK(move_zeroes({}).empty());
  CHECK((move_zeroes({0}) == std::vector<int>{0}));
  CHECK((move_zeroes({7}) == std::vector<int>{7}));
}

static void test_negatives_kept() {
  CHECK((move_zeroes({0, -1, 0, -2}) == std::vector<int>{-1, -2, 0, 0}));
}

int main() {
  test_basic();
  test_no_zeroes();
  test_all_zeroes();
  test_preserves_order();
  test_empty_and_single();
  test_negatives_kept();
  return REPORT();
}
