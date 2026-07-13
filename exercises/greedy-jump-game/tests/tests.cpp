// Tests for greedy-jump-game. Build with -I _harness and the impl dir.
#include <vector>

#include "check.hpp"
#include "jump_game.hpp"

static void test_reachable() {
  CHECK(can_jump({2, 3, 1, 1, 4}));
}

static void test_stuck_at_zero() {
  CHECK(!can_jump({3, 2, 1, 0, 4}));
}

static void test_single() {
  CHECK(can_jump({0}));
}

static void test_empty() {
  CHECK(can_jump({}));
}

static void test_zero_then_more() {
  CHECK(can_jump({2, 0, 0}));  // jump 2 straight to the end
}

static void test_blocked() {
  CHECK(!can_jump({1, 0, 1}));  // stuck at index 1
}

static void test_exact_reach() {
  CHECK(can_jump({1, 1, 1, 1}));
}

int main() {
  test_reachable();
  test_stuck_at_zero();
  test_single();
  test_empty();
  test_zero_then_more();
  test_blocked();
  test_exact_reach();
  return REPORT();
}
