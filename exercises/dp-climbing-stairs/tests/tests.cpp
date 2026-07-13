// Tests for dp-climbing-stairs. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "climb_stairs.hpp"

static void test_base_cases() {
  CHECK(climb_stairs(0) == 1);
  CHECK(climb_stairs(1) == 1);
}

static void test_small() {
  CHECK(climb_stairs(2) == 2);
  CHECK(climb_stairs(3) == 3);
  CHECK(climb_stairs(4) == 5);
  CHECK(climb_stairs(5) == 8);
}

static void test_ten() {
  CHECK(climb_stairs(10) == 89);
}

static void test_larger_uses_long_long() {
  // ways(45) = fib(46) = 1836311903, still fits in a long long.
  CHECK(climb_stairs(45) == 1836311903LL);
}

int main() {
  test_base_cases();
  test_small();
  test_ten();
  test_larger_uses_long_long();
  return REPORT();
}
