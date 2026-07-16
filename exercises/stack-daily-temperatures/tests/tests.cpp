// Tests for stack-daily-temperatures. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "daily_temperatures.hpp"

#include <vector>

static void test_classic() {
  CHECK(daily_temperatures(std::vector<int>{73, 74, 75, 71, 69, 72, 76, 73}) ==
        (std::vector<int>{1, 1, 4, 2, 1, 1, 0, 0}));
}

static void test_increasing() {
  CHECK(daily_temperatures(std::vector<int>{30, 40, 50, 60}) == (std::vector<int>{1, 1, 1, 0}));
}

static void test_decreasing() {
  CHECK(daily_temperatures(std::vector<int>{60, 50, 40, 30}) == (std::vector<int>{0, 0, 0, 0}));
}

static void test_single() {
  CHECK(daily_temperatures(std::vector<int>{50}) == (std::vector<int>{0}));
}

static void test_plateau() {
  // Equal temperatures are NOT strictly warmer.
  CHECK(daily_temperatures(std::vector<int>{40, 40, 41}) == (std::vector<int>{2, 1, 0}));
}

int main() {
  test_classic();
  test_increasing();
  test_decreasing();
  test_single();
  test_plateau();
  return REPORT();
}
