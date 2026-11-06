#include "check.hpp"
#include "concurrent_stats.hpp"
#include <vector>

static void test_empty_input() {
  const auto result = parallel_stats({}, 4);
  CHECK(result.count == 0);
  CHECK(result.sum == 0);
}
static void test_single_worker() {
  const auto result = parallel_stats({1, 2, 3, 4}, 1);
  CHECK(result.count == 4);
  CHECK(result.sum == 10);
}
static void test_many_workers() {
  const auto result = parallel_stats({5, -7, 10, 2, 1}, 8);
  CHECK(result.count == 5);
  CHECK(result.sum == 11);
}
static void test_zero_workers() {
  const auto result = parallel_stats({2, 3}, 0);
  CHECK(result.count == 0);
  CHECK(result.sum == 0);
}
static void test_repeatable_invariants() {
  std::vector<int> values(1000);
  for (int i = 0; i < 1000; ++i) values[i] = i - 500;
  for (int run = 0; run < 8; ++run) {
    const auto result = parallel_stats(values, 7);
    CHECK(result.count == 1000);
    CHECK(result.sum == -500);
  }
}
int main() {
  test_empty_input();
  test_single_worker();
  test_many_workers();
  test_zero_workers();
  test_repeatable_invariants();
  return REPORT();
}
