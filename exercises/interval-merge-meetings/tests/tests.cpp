// Tests for interval-merge-meetings. Build with -I _harness and the impl dir.
#include <vector>

#include "check.hpp"
#include "merge_intervals.hpp"

using Ivs = std::vector<Interval>;

static void test_basic_merge() {
  Ivs in{{1, 3}, {2, 6}, {8, 10}, {15, 18}};
  Ivs expected{{1, 6}, {8, 10}, {15, 18}};
  CHECK(merge_intervals(in) == expected);
}

static void test_touching_merge() {
  Ivs in{{1, 4}, {4, 5}};
  Ivs expected{{1, 5}};
  CHECK(merge_intervals(in) == expected);
}

static void test_nested() {
  Ivs in{{1, 10}, {2, 3}, {4, 8}};
  Ivs expected{{1, 10}};
  CHECK(merge_intervals(in) == expected);
}

static void test_unsorted_input() {
  Ivs in{{8, 10}, {1, 3}, {2, 6}};
  Ivs expected{{1, 6}, {8, 10}};
  CHECK(merge_intervals(in) == expected);
}

static void test_no_overlap() {
  Ivs in{{1, 2}, {3, 4}, {5, 6}};
  CHECK(merge_intervals(in) == in);
}

static void test_single_and_empty() {
  CHECK(merge_intervals({}).empty());
  Ivs one{{3, 7}};
  CHECK(merge_intervals(one) == one);
}

int main() {
  test_basic_merge();
  test_touching_merge();
  test_nested();
  test_unsorted_input();
  test_no_overlap();
  test_single_and_empty();
  return REPORT();
}
