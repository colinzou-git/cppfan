// Tests for binary-search-first-last. Build with -I _harness and the impl dir.
#include <utility>
#include <vector>

#include "check.hpp"
#include "first_last.hpp"

static void test_range_of_duplicates() {
  std::vector<int> v{5, 7, 7, 8, 8, 10};
  auto r = first_last(v, 8);
  CHECK(r.first == 3 && r.second == 4);
}

static void test_middle_pair() {
  std::vector<int> v{5, 7, 7, 8, 8, 10};
  auto r = first_last(v, 7);
  CHECK(r.first == 1 && r.second == 2);
}

static void test_not_found() {
  std::vector<int> v{5, 7, 7, 8, 8, 10};
  auto r = first_last(v, 6);
  CHECK(r.first == -1 && r.second == -1);
}

static void test_single_occurrence() {
  std::vector<int> v{1, 2, 3};
  auto r = first_last(v, 2);
  CHECK(r.first == 1 && r.second == 1);
}

static void test_ends() {
  std::vector<int> v{2, 2, 3, 4, 4};
  CHECK((first_last(v, 2) == std::pair<int, int>{0, 1}));
  CHECK((first_last(v, 4) == std::pair<int, int>{3, 4}));
}

static void test_empty() {
  std::vector<int> v{};
  auto r = first_last(v, 1);
  CHECK(r.first == -1 && r.second == -1);
}

static void test_all_same() {
  std::vector<int> v{9, 9, 9, 9};
  auto r = first_last(v, 9);
  CHECK(r.first == 0 && r.second == 3);
}

int main() {
  test_range_of_duplicates();
  test_middle_pair();
  test_not_found();
  test_single_occurrence();
  test_ends();
  test_empty();
  test_all_same();
  return REPORT();
}
