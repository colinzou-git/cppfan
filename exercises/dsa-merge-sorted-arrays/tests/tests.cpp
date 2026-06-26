// Tests for dsa-merge-sorted-arrays. Build with -I _harness and the impl dir.
#include <vector>

#include "check.hpp"
#include "merge_sorted.hpp"

static void test_basic() {
  const std::vector<int> r = merge_sorted({1, 3, 5}, {2, 4, 6});
  CHECK((r == std::vector<int>{1, 2, 3, 4, 5, 6}));
}

static void test_one_empty() {
  CHECK((merge_sorted({}, {1, 2, 3}) == std::vector<int>{1, 2, 3}));
  CHECK((merge_sorted({4, 5}, {}) == std::vector<int>{4, 5}));
}

static void test_both_empty() {
  CHECK(merge_sorted({}, {}).empty());
}

static void test_duplicates() {
  const std::vector<int> r = merge_sorted({1, 1, 2}, {1, 3});
  CHECK((r == std::vector<int>{1, 1, 1, 2, 3}));
}

static void test_uneven_lengths() {
  const std::vector<int> r = merge_sorted({0, 10}, {1, 2, 3, 4, 5});
  CHECK((r == std::vector<int>{0, 1, 2, 3, 4, 5, 10}));
}

static void test_negatives() {
  const std::vector<int> r = merge_sorted({-5, -1}, {-3, 0});
  CHECK((r == std::vector<int>{-5, -3, -1, 0}));
}

int main() {
  test_basic();
  test_one_empty();
  test_both_empty();
  test_duplicates();
  test_uneven_lengths();
  test_negatives();
  return REPORT();
}
