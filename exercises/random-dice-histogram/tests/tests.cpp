// Tests for random-dice-histogram. Build with -I _harness and the impl dir.
#include <array>
#include <numeric>

#include "check.hpp"
#include "dice_histogram.hpp"

using H = std::array<int, 6>;

static void test_seed42_six_rolls() {
  CHECK((roll_histogram(42, 6) == H{2, 0, 0, 0, 2, 2}));
}

static void test_seed1_twelve_rolls() {
  CHECK((roll_histogram(1, 12) == H{2, 3, 2, 1, 0, 4}));
}

static void test_zero_rolls() {
  CHECK((roll_histogram(7, 0) == H{0, 0, 0, 0, 0, 0}));
}

static void test_counts_sum_to_rolls() {
  H h = roll_histogram(42, 6000);
  CHECK(std::accumulate(h.begin(), h.end(), 0) == 6000);
}

static void test_large_distribution_exact() {
  CHECK((roll_histogram(42, 6000) == H{975, 1019, 997, 1008, 1046, 955}));
}

int main() {
  test_seed42_six_rolls();
  test_seed1_twelve_rolls();
  test_zero_rolls();
  test_counts_sum_to_rolls();
  test_large_distribution_exact();
  return REPORT();
}
