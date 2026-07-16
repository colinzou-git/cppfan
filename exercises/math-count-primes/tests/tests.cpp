// Tests for math-count-primes. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "count_primes.hpp"

static void test_small() {
  CHECK(count_primes(10) == 4);  // 2, 3, 5, 7
}

static void test_ten() {
  CHECK(count_primes(20) == 8);  // 2,3,5,7,11,13,17,19
}

static void test_none() {
  CHECK(count_primes(2) == 0);
  CHECK(count_primes(3) == 1);   // just 2
}

static void test_edge() {
  CHECK(count_primes(0) == 0);
  CHECK(count_primes(1) == 0);
}

static void test_larger() {
  CHECK(count_primes(100) == 25);
  CHECK(count_primes(1000) == 168);
}

int main() {
  test_small();
  test_ten();
  test_none();
  test_edge();
  test_larger();
  return REPORT();
}
