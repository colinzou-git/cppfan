// Tests for concurrency-atomic-counter. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "atomic_counter.hpp"

static void test_four_threads() {
  CHECK(concurrent_increment(4, 1000) == 4000);
}

static void test_single_thread() {
  CHECK(concurrent_increment(1, 5) == 5);
}

static void test_many_threads() {
  CHECK(concurrent_increment(8, 100) == 800);
}

static void test_zero_threads() {
  CHECK(concurrent_increment(0, 100) == 0);
}

static void test_zero_work() {
  CHECK(concurrent_increment(4, 0) == 0);
}

static void test_repeatable_under_contention() {
  // Run several times; an unsynchronized counter would sometimes lose updates.
  for (int trial = 0; trial < 20; ++trial) {
    CHECK(concurrent_increment(8, 500) == 4000);
  }
}

int main() {
  test_four_threads();
  test_single_thread();
  test_many_threads();
  test_zero_threads();
  test_zero_work();
  test_repeatable_under_contention();
  return REPORT();
}
