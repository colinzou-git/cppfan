// Tests for loops-number-summary. Build with -I _harness and the implementation dir.
#include <vector>

#include "check.hpp"
#include "number_summary.hpp"

static void test_basic_summary() {
  NumberSummary s = summarize({1, 2, 3, 4, 5});
  CHECK(s.count == 5);
  CHECK(s.sum == 15);
  CHECK(s.even_count == 2);
}

static void test_single_element() {
  NumberSummary s = summarize({7});
  CHECK(s.count == 1 && s.sum == 7 && s.min == 7 && s.max == 7 && s.even_count == 0);
}

static void test_empty_input() {
  NumberSummary s = summarize({});
  CHECK(s.count == 0 && s.sum == 0 && s.even_count == 0);
}

static void test_handles_negatives() {
  NumberSummary s = summarize({-5, -2, 3});
  CHECK(s.sum == -4);
  CHECK(s.min == -5);
  CHECK(s.max == 3);
}

static void test_counts_even_numbers() {
  NumberSummary s = summarize({-4, -2, 0, 2, 4});
  CHECK(s.even_count == 5);
}

static void test_min_and_max() {
  NumberSummary s = summarize({8, 1, 9, 3, 9, 2});
  CHECK(s.min == 1 && s.max == 9);
}

int main() {
  test_basic_summary();
  test_single_element();
  test_empty_input();
  test_handles_negatives();
  test_counts_even_numbers();
  test_min_and_max();
  return REPORT();
}
