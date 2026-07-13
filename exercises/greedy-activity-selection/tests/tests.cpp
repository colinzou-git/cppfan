// Tests for greedy-activity-selection. Build with -I _harness and the impl dir.
#include <vector>

#include "check.hpp"
#include "activity_selection.hpp"

static void test_classic() {
  std::vector<Activity> a{{1, 4}, {3, 5}, {0, 6}, {5, 7}, {3, 9}, {5, 9}, {6, 10}, {8, 11}, {8, 12}, {2, 14}, {12, 16}};
  CHECK(max_activities(a) == 4);  // {1,4},{5,7},{8,11},{12,16}
}

static void test_empty() {
  CHECK(max_activities({}) == 0);
}

static void test_single() {
  CHECK(max_activities({{2, 5}}) == 1);
}

static void test_all_overlap() {
  CHECK(max_activities({{1, 10}, {2, 9}, {3, 8}}) == 1);
}

static void test_all_disjoint() {
  CHECK(max_activities({{1, 2}, {3, 4}, {5, 6}}) == 3);
}

static void test_touching_is_compatible() {
  // ends at 2, next starts at 2 -> compatible
  CHECK(max_activities({{0, 2}, {2, 4}, {4, 6}}) == 3);
}

int main() {
  test_classic();
  test_empty();
  test_single();
  test_all_overlap();
  test_all_disjoint();
  test_touching_is_compatible();
  return REPORT();
}
