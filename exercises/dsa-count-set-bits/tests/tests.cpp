// Tests for dsa-count-set-bits. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "count_bits.hpp"

static void test_zero() {
  CHECK(count_set_bits(0u) == 0);
}

static void test_powers_of_two() {
  CHECK(count_set_bits(1u) == 1);
  CHECK(count_set_bits(8u) == 1);
  CHECK(count_set_bits(1024u) == 1);
}

static void test_small_values() {
  CHECK(count_set_bits(7u) == 3);    // 0b111
  CHECK(count_set_bits(255u) == 8);  // 0b11111111
  CHECK(count_set_bits(6u) == 2);    // 0b110
}

static void test_all_bits() {
  CHECK(count_set_bits(0xFFFFFFFFu) == 32);
}

static void test_mixed() {
  CHECK(count_set_bits(0xA5u) == 4);  // 1010 0101
  CHECK(count_set_bits(0x80000001u) == 2);
}

int main() {
  test_zero();
  test_powers_of_two();
  test_small_values();
  test_all_bits();
  test_mixed();
  return REPORT();
}
