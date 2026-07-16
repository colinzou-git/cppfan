// Tests for dp-min-path-sum. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "min_path_sum.hpp"

#include <vector>

using Grid = std::vector<std::vector<int>>;

static void test_classic() {
  // 1 3 1 / 1 5 1 / 4 2 1 -> path 1->3->1->1->1 = 7.
  CHECK(min_path_sum(Grid{{1, 3, 1}, {1, 5, 1}, {4, 2, 1}}) == 7);
}

static void test_single_cell() {
  CHECK(min_path_sum(Grid{{5}}) == 5);
}

static void test_single_row() {
  CHECK(min_path_sum(Grid{{1, 2, 3}}) == 6);
}

static void test_single_column() {
  CHECK(min_path_sum(Grid{{1}, {2}, {3}}) == 6);
}

static void test_two_by_two() {
  CHECK(min_path_sum(Grid{{1, 2}, {1, 1}}) == 3);  // 1->1->1
}

int main() {
  test_classic();
  test_single_cell();
  test_single_row();
  test_single_column();
  test_two_by_two();
  return REPORT();
}
