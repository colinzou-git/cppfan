// Tests for array-container-most-water. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "most_water.hpp"

#include <vector>

static void test_classic() {
  CHECK(most_water(std::vector<int>{1, 8, 6, 2, 5, 4, 8, 3, 7}) == 49);
}

static void test_two_lines() {
  CHECK(most_water(std::vector<int>{1, 1}) == 1);
}

static void test_flat() {
  CHECK(most_water(std::vector<int>{4, 4, 4, 4}) == 12);  // ends: 4 * 3
}

static void test_increasing() {
  CHECK(most_water(std::vector<int>{1, 2, 3, 4, 5}) == 6);  // min(2,5)*3 = 6
}

static void test_valley() {
  CHECK(most_water(std::vector<int>{5, 1, 1, 1, 5}) == 20);  // 5 * 4
}

int main() {
  test_classic();
  test_two_lines();
  test_flat();
  test_increasing();
  test_valley();
  return REPORT();
}
