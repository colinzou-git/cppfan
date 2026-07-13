// Tests for concurrency-producer-consumer. Build with -I _harness and impl dir.
#include "check.hpp"
#include "producer_consumer.hpp"

static void test_basic() {
  // 2 producers each push 1..4 (sum 10) -> 20.
  CHECK(producer_consumer_total(2, 3, 4) == 20);
}

static void test_single_pair() {
  CHECK(producer_consumer_total(1, 1, 5) == 15);
}

static void test_many() {
  CHECK(producer_consumer_total(4, 2, 10) == 220);  // 55 * 4
}

static void test_one_item_each() {
  CHECK(producer_consumer_total(3, 4, 1) == 3);
}

static void test_no_producers() {
  CHECK(producer_consumer_total(0, 2, 5) == 0);
}

static void test_repeatable_under_contention() {
  for (int trial = 0; trial < 15; ++trial) {
    CHECK(producer_consumer_total(3, 3, 100) == 15150);  // 5050 * 3
  }
}

int main() {
  test_basic();
  test_single_pair();
  test_many();
  test_one_item_each();
  test_no_producers();
  test_repeatable_under_contention();
  return REPORT();
}
