// Tests for debug-fix-off-by-one. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "range_sum.hpp"

static void test_one_to_five() {
  CHECK(range_sum(1, 5) == 15);  // 1+2+3+4+5
}

static void test_single_value() {
  CHECK(range_sum(3, 3) == 3);
}

static void test_zero_to_ten() {
  CHECK(range_sum(0, 10) == 55);
}

static void test_symmetric_negatives() {
  CHECK(range_sum(-2, 2) == 0);
}

static void test_hundred() {
  CHECK(range_sum(1, 100) == 5050);
}

int main() {
  test_one_to_five();
  test_single_value();
  test_zero_to_ten();
  test_symmetric_negatives();
  test_hundred();
  return REPORT();
}
