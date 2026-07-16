// Tests for bit-power-of-two. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "power_of_two.hpp"

static void test_powers() {
  CHECK(is_power_of_two(2) == true);
  CHECK(is_power_of_two(4) == true);
  CHECK(is_power_of_two(16) == true);
  CHECK(is_power_of_two(1024) == true);
}

static void test_non_powers() {
  CHECK(is_power_of_two(3) == false);
  CHECK(is_power_of_two(6) == false);
  CHECK(is_power_of_two(1000) == false);
}

static void test_one() {
  CHECK(is_power_of_two(1) == true);  // 2^0
}

static void test_zero_and_negative() {
  CHECK(is_power_of_two(0) == false);
  CHECK(is_power_of_two(-2) == false);
  CHECK(is_power_of_two(-16) == false);
}

static void test_large() {
  CHECK(is_power_of_two(1 << 30) == true);
  CHECK(is_power_of_two((1 << 30) + 1) == false);
}

int main() {
  test_powers();
  test_non_powers();
  test_one();
  test_zero_and_negative();
  test_large();
  return REPORT();
}
