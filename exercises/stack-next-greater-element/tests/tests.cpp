// Tests for stack-next-greater-element. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "next_greater.hpp"

#include <vector>

static void test_basic() {
  CHECK(next_greater(std::vector<int>{2, 1, 2, 4, 3}) == (std::vector<int>{4, 2, 4, -1, -1}));
}

static void test_increasing() {
  CHECK(next_greater(std::vector<int>{1, 2, 3, 4}) == (std::vector<int>{2, 3, 4, -1}));
}

static void test_decreasing() {
  CHECK(next_greater(std::vector<int>{4, 3, 2, 1}) == (std::vector<int>{-1, -1, -1, -1}));
}

static void test_single() {
  CHECK(next_greater(std::vector<int>{7}) == (std::vector<int>{-1}));
}

static void test_duplicates() {
  // Equal values are not strictly greater.
  CHECK(next_greater(std::vector<int>{2, 2, 3}) == (std::vector<int>{3, 3, -1}));
}

int main() {
  test_basic();
  test_increasing();
  test_decreasing();
  test_single();
  test_duplicates();
  return REPORT();
}
