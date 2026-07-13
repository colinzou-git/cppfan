// Tests for dp-coin-change-min. Build with -I _harness and the impl dir.
#include <vector>

#include "check.hpp"
#include "coin_change.hpp"

static void test_basic() {
  CHECK(coin_change({1, 2, 5}, 11) == 3);  // 5 + 5 + 1
}

static void test_small_amount() {
  CHECK(coin_change({1, 2, 5}, 3) == 2);  // 1 + 2
}

static void test_zero_amount() {
  CHECK(coin_change({1, 2, 5}, 0) == 0);
}

static void test_impossible() {
  CHECK(coin_change({2}, 3) == -1);
}

static void test_single_coin_repeated() {
  CHECK(coin_change({1}, 5) == 5);
}

static void test_prefers_larger_coins() {
  CHECK(coin_change({1, 3, 4}, 6) == 2);  // 3 + 3, not 4 + 1 + 1
}

static void test_no_coins() {
  CHECK(coin_change({}, 7) == -1);
  CHECK(coin_change({}, 0) == 0);
}

int main() {
  test_basic();
  test_small_amount();
  test_zero_amount();
  test_impossible();
  test_single_coin_repeated();
  test_prefers_larger_coins();
  test_no_coins();
  return REPORT();
}
