// Tests for backtracking-combination-sum. Build with -I _harness and impl dir.
#include <vector>

#include "check.hpp"
#include "combination_sum.hpp"

using VV = std::vector<std::vector<int>>;

static void test_basic() {
  CHECK((combination_sum({2, 3, 6, 7}, 7) == VV{{2, 2, 3}, {7}}));
}

static void test_multiple() {
  CHECK((combination_sum({2, 3, 5}, 8) == VV{{2, 2, 2, 2}, {2, 3, 3}, {3, 5}}));
}

static void test_unreachable() {
  CHECK(combination_sum({2}, 1).empty());
}

static void test_single_candidate_repeated() {
  CHECK((combination_sum({1}, 2) == VV{{1, 1}}));
}

static void test_unsorted_input() {
  CHECK((combination_sum({4, 2}, 6) == VV{{2, 2, 2}, {2, 4}}));
}

static void test_target_zero() {
  CHECK((combination_sum({1, 2}, 0) == VV{{}}));
}

int main() {
  test_basic();
  test_multiple();
  test_unreachable();
  test_single_candidate_repeated();
  test_unsorted_input();
  test_target_zero();
  return REPORT();
}
