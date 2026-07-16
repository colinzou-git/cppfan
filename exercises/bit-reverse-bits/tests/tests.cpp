// Tests for bit-reverse-bits. Build with -I _harness and the impl dir.
#include <cstdint>

#include "check.hpp"
#include "reverse_bits.hpp"

static void test_example() {
  CHECK(reverse_bits(43261596u) == 964176192u);
}

static void test_zero() {
  CHECK(reverse_bits(0u) == 0u);
}

static void test_all_ones() {
  CHECK(reverse_bits(0xFFFFFFFFu) == 0xFFFFFFFFu);
}

static void test_one() {
  CHECK(reverse_bits(1u) == 0x80000000u);
}

static void test_high_bit() {
  CHECK(reverse_bits(0x80000000u) == 1u);
}

int main() {
  test_example();
  test_zero();
  test_all_ones();
  test_one();
  test_high_bit();
  return REPORT();
}
