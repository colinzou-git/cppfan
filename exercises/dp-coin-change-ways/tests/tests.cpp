// Tests for dp-coin-change-ways. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "count_ways.hpp"

#include <vector>

static void test_basic() {
  // 5; 2+2+1; 2+1+1+1; 1+1+1+1+1
  CHECK(count_ways(std::vector<int>{1, 2, 5}, 5) == 4);
}

static void test_none() {
  CHECK(count_ways(std::vector<int>{2}, 3) == 0);
}

static void test_zero() {
  CHECK(count_ways(std::vector<int>{1, 2, 5}, 0) == 1);
}

static void test_single_coin() {
  CHECK(count_ways(std::vector<int>{10}, 10) == 1);
  CHECK(count_ways(std::vector<int>{7}, 14) == 1);
}

static void test_multiple() {
  // 1+1+1+1; 1+1+2; 2+2; 1+3
  CHECK(count_ways(std::vector<int>{1, 2, 3}, 4) == 4);
}

int main() {
  test_basic();
  test_none();
  test_zero();
  test_single_coin();
  test_multiple();
  return REPORT();
}
