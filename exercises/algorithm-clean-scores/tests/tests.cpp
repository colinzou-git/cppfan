// Tests for algorithm-clean-scores. Build with -I _harness and the impl dir.
#include <vector>

#include "check.hpp"
#include "clean_scores.hpp"

static void test_sorts_and_dedupes() {
  CHECK((clean_scores({50, 20, 50, 30}, 0, 100) == std::vector<int>{20, 30, 50}));
}

static void test_drops_out_of_range() {
  CHECK((clean_scores({-5, 40, 150, 40, 90}, 0, 100) == std::vector<int>{40, 90}));
}

static void test_inclusive_bounds() {
  CHECK((clean_scores({0, 100, 101, -1}, 0, 100) == std::vector<int>{0, 100}));
}

static void test_all_invalid() {
  CHECK(clean_scores({-1, 200, 999}, 0, 100).empty());
}

static void test_empty() {
  CHECK(clean_scores({}, 0, 100).empty());
}

static void test_already_clean() {
  CHECK((clean_scores({1, 2, 3}, 0, 10) == std::vector<int>{1, 2, 3}));
}

int main() {
  test_sorts_and_dedupes();
  test_drops_out_of_range();
  test_inclusive_bounds();
  test_all_invalid();
  test_empty();
  test_already_clean();
  return REPORT();
}
