// Tests for dp-partition-equal-subset-sum. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "can_partition.hpp"

#include <vector>

static void test_basic() {
  CHECK(can_partition(std::vector<int>{1, 5, 11, 5}) == true);  // {11} | {1,5,5}
}

static void test_false() {
  CHECK(can_partition(std::vector<int>{1, 2, 3, 5}) == false);  // sum 11 is odd
  CHECK(can_partition(std::vector<int>{1, 2, 5}) == false);     // no subset sums to 4
}

static void test_single() {
  CHECK(can_partition(std::vector<int>{1}) == false);
  CHECK(can_partition(std::vector<int>{2}) == false);
}

static void test_empty() {
  CHECK(can_partition(std::vector<int>{}) == true);  // two empty halves, sum 0
}

static void test_all_equal() {
  CHECK(can_partition(std::vector<int>{3, 3}) == true);
  CHECK(can_partition(std::vector<int>{4, 4, 4, 4}) == true);
}

int main() {
  test_basic();
  test_false();
  test_single();
  test_empty();
  test_all_equal();
  return REPORT();
}
