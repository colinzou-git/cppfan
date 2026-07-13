// Tests for array-remove-duplicates-sorted. Build with -I _harness and impl dir.
#include <vector>

#include "check.hpp"
#include "remove_dups.hpp"

static void test_basic() {
  std::vector<int> v{1, 1, 2, 2, 3};
  int k = remove_duplicates(v);
  CHECK(k == 3);
  CHECK(v[0] == 1 && v[1] == 2 && v[2] == 3);
}

static void test_already_unique() {
  std::vector<int> v{1, 2, 3, 4};
  int k = remove_duplicates(v);
  CHECK(k == 4);
  CHECK(v[0] == 1 && v[1] == 2 && v[2] == 3 && v[3] == 4);
}

static void test_all_same() {
  std::vector<int> v{5, 5, 5, 5};
  int k = remove_duplicates(v);
  CHECK(k == 1);
  CHECK(v[0] == 5);
}

static void test_empty() {
  std::vector<int> v{};
  CHECK(remove_duplicates(v) == 0);
}

static void test_single() {
  std::vector<int> v{9};
  int k = remove_duplicates(v);
  CHECK(k == 1 && v[0] == 9);
}

static void test_negatives_and_run() {
  std::vector<int> v{-3, -3, -1, 0, 0, 0, 2};
  int k = remove_duplicates(v);
  CHECK(k == 4);
  CHECK(v[0] == -3 && v[1] == -1 && v[2] == 0 && v[3] == 2);
}

int main() {
  test_basic();
  test_already_unique();
  test_all_same();
  test_empty();
  test_single();
  test_negatives_and_run();
  return REPORT();
}
