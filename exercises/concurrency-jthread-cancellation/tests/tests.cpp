#include "check.hpp"
#include "cooperative_stop.hpp"

static void test_zero_workers() { CHECK(count_cooperative_stops(0) == 0); }
static void test_one_worker() { CHECK(count_cooperative_stops(1) == 1); }
static void test_multiple_workers() { CHECK(count_cooperative_stops(8) == 8); }
static void test_negative_workers() { CHECK(count_cooperative_stops(-1) == 0); }
static void test_repeatable_shutdown() {
  for (int i = 0; i < 12; ++i) CHECK(count_cooperative_stops(4) == 4);
}
int main() {
  test_zero_workers();
  test_one_worker();
  test_multiple_workers();
  test_negative_workers();
  test_repeatable_shutdown();
  return REPORT();
}
