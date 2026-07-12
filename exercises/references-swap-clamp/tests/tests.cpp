// Tests for references-swap-clamp. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "swap_clamp.hpp"

static void test_swap_exchanges_values() {
  int a = 3;
  int b = 8;
  swap_ints(a, b);
  CHECK(a == 8 && b == 3);
}

static void test_swap_equal_values() {
  int a = 5;
  int b = 5;
  swap_ints(a, b);
  CHECK(a == 5 && b == 5);
}

static void test_clamp_below_range() {
  CHECK(clamp_value(-4, 0, 10) == 0);
}

static void test_clamp_above_range() {
  CHECK(clamp_value(42, 0, 10) == 10);
}

static void test_clamp_within_range() {
  CHECK(clamp_value(7, 0, 10) == 7);
  CHECK(clamp_value(0, 0, 10) == 0);
  CHECK(clamp_value(10, 0, 10) == 10);
}

static void test_clamp_in_place_modifies() {
  int v = 99;
  clamp_in_place(v, -5, 5);
  CHECK(v == 5);
  int w = -20;
  clamp_in_place(w, -5, 5);
  CHECK(w == -5);
}

static void test_max_of_reads_without_mutating() {
  int a = 4;
  int b = 9;
  CHECK(max_of(a, b) == 9);
  CHECK(a == 4 && b == 9);
}

int main() {
  test_swap_exchanges_values();
  test_swap_equal_values();
  test_clamp_below_range();
  test_clamp_above_range();
  test_clamp_within_range();
  test_clamp_in_place_modifies();
  test_max_of_reads_without_mutating();
  return REPORT();
}
