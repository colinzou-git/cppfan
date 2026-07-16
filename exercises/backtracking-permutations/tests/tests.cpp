// Tests for backtracking-permutations. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "permutations.hpp"

#include <vector>

static void test_empty() {
  // One permutation of nothing: the empty ordering.
  CHECK(permutations(std::vector<int>{}) == std::vector<std::vector<int>>{{}});
}

static void test_single() {
  CHECK(permutations(std::vector<int>{5}) == std::vector<std::vector<int>>{{5}});
}

static void test_two() {
  CHECK(permutations(std::vector<int>{1, 2}) == (std::vector<std::vector<int>>{{1, 2}, {2, 1}}));
}

static void test_three_count() {
  CHECK(permutations(std::vector<int>{1, 2, 3}).size() == 6);
}

static void test_lexicographic() {
  // Unsorted input is normalized: the first permutation is fully sorted.
  auto perms = permutations(std::vector<int>{2, 1, 3});
  CHECK(perms.size() == 6);
  CHECK(perms.front() == (std::vector<int>{1, 2, 3}));
  CHECK(perms.back() == (std::vector<int>{3, 2, 1}));
}

int main() {
  test_empty();
  test_single();
  test_two();
  test_three_count();
  test_lexicographic();
  return REPORT();
}
