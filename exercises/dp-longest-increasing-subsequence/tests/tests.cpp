// Tests for dp-longest-increasing-subsequence. Build with -I _harness and impl.
#include "check.hpp"
#include "lis.hpp"

#include <vector>

static void test_empty() {
  CHECK(lis_length(std::vector<int>{}) == 0);
}

static void test_single() {
  CHECK(lis_length(std::vector<int>{7}) == 1);
}

static void test_strictly_increasing() {
  CHECK(lis_length(std::vector<int>{1, 2, 3, 4, 5}) == 5);
}

static void test_strictly_decreasing() {
  CHECK(lis_length(std::vector<int>{5, 4, 3, 2, 1}) == 1);
}

static void test_general() {
  // 2,3,7,101 (or 2,3,7,18) -> length 4
  CHECK(lis_length(std::vector<int>{10, 9, 2, 5, 3, 7, 101, 18}) == 4);
  // 0,1,2,3 -> length 4
  CHECK(lis_length(std::vector<int>{0, 8, 1, 9, 2, 3}) == 4);
}

static void test_duplicates() {
  // strictly increasing: equal values cannot chain -> 1
  CHECK(lis_length(std::vector<int>{7, 7, 7, 7}) == 1);
  // 1,3,5 (skipping the repeats) -> length 3
  CHECK(lis_length(std::vector<int>{1, 3, 3, 5, 5}) == 3);
}

int main() {
  test_empty();
  test_single();
  test_strictly_increasing();
  test_strictly_decreasing();
  test_general();
  test_duplicates();
  return REPORT();
}
