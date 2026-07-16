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

// Fewer than two lines hold no water.
static void test_empty_and_single() {
  CHECK(most_water(std::vector<int>{}) == 0);
  CHECK(most_water(std::vector<int>{7}) == 0);
}

// The area can exceed INT_MAX; the 64-bit contract must return the exact value
// without a signed-overflow multiply. min(2e9, 2e9) * 2 = 4'000'000'000.
static void test_area_exceeds_int_max() {
  CHECK(most_water(std::vector<int>{2000000000, 0, 2000000000}) == 4000000000LL);
}

int main() {
  test_classic();
  test_two_lines();
  test_flat();
  test_increasing();
  test_valley();
  test_empty_and_single();
  test_area_exceeds_int_max();
  return REPORT();
}
