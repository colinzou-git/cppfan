// Tests for math-fast-power-mod. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "fast_power.hpp"

static void test_basic() {
  CHECK(power_mod(2, 10, 1000) == 24);  // 1024 % 1000
}

static void test_exponent_zero() {
  CHECK(power_mod(3, 0, 5) == 1);
}

static void test_mod_one() {
  CHECK(power_mod(2, 10, 1) == 0);
}

static void test_base_zero() {
  CHECK(power_mod(0, 5, 7) == 0);
}

static void test_small_wraps() {
  CHECK(power_mod(7, 3, 100) == 43);  // 343 % 100
  CHECK(power_mod(5, 1, 3) == 2);
}

static void test_large_no_overflow() {
  // 2^62 mod (1e9+7); intermediate products need 128-bit width.
  CHECK(power_mod(2, 62, 1000000007LL) == 145586002);
  CHECK(power_mod(10, 9, 1000000007LL) == 1000000000);
}

int main() {
  test_basic();
  test_exponent_zero();
  test_mod_one();
  test_base_zero();
  test_small_wraps();
  test_large_no_overflow();
  return REPORT();
}
