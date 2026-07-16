// Tests for bit-hamming-distance. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "hamming_distance.hpp"

static void test_classic() {
  // 1 = 0001, 4 = 0100 -> differ in two positions.
  CHECK(hamming_distance(1, 4) == 2);
}

static void test_equal() {
  CHECK(hamming_distance(0, 0) == 0);
  CHECK(hamming_distance(255, 255) == 0);
}

static void test_zero_and_value() {
  CHECK(hamming_distance(0, 7) == 3);   // 0111 has three set bits
  CHECK(hamming_distance(1024, 0) == 1);
}

static void test_all_bits() {
  // 0 vs a byte of all ones differs in eight positions.
  CHECK(hamming_distance(0, 255) == 8);
}

static void test_one_bit() {
  CHECK(hamming_distance(2, 3) == 1);   // 10 vs 11
  CHECK(hamming_distance(8, 9) == 1);   // 1000 vs 1001
}

int main() {
  test_classic();
  test_equal();
  test_zero_and_value();
  test_all_bits();
  test_one_bit();
  return REPORT();
}
