// Tests for priority-queue-top-k. Build with -I _harness and the impl dir.
#include <vector>

#include "check.hpp"
#include "top_k.hpp"

static void test_top_three() {
  CHECK((top_k({4, 1, 7, 3, 9, 2}, 3) == std::vector<int>{9, 7, 4}));
}

static void test_k_one() {
  CHECK((top_k({4, 1, 7, 3}, 1) == std::vector<int>{7}));
}

static void test_k_ge_size_sorts_all() {
  CHECK((top_k({2, 5, 1}, 10) == std::vector<int>{5, 2, 1}));
}

static void test_k_zero_or_negative() {
  CHECK(top_k({1, 2, 3}, 0).empty());
  CHECK(top_k({1, 2, 3}, -2).empty());
}

static void test_keeps_duplicates() {
  CHECK((top_k({5, 5, 5, 1}, 2) == std::vector<int>{5, 5}));
}

static void test_handles_negatives() {
  CHECK((top_k({-3, -1, -7, -2}, 2) == std::vector<int>{-1, -2}));
}

int main() {
  test_top_three();
  test_k_one();
  test_k_ge_size_sorts_all();
  test_k_zero_or_negative();
  test_keeps_duplicates();
  test_handles_negatives();
  return REPORT();
}
