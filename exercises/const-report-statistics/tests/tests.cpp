// Tests for const-report-statistics. Build with -I _harness and the impl dir.
#include <cmath>
#include <vector>

#include "check.hpp"
#include "report_statistics.hpp"

static bool close(double a, double b) {
  return std::fabs(a - b) < 1e-9;
}

static void test_basic_mean() {
  Stats s = compute_stats({2.0, 4.0, 6.0});
  CHECK(close(s.mean, 4.0));
}

static void test_single_value() {
  Stats s = compute_stats({5.5});
  CHECK(close(s.mean, 5.5));
  CHECK(close(s.min, 5.5) && close(s.max, 5.5));
  CHECK(close(s.range, 0.0));
}

static void test_min_max_range() {
  Stats s = compute_stats({3.0, 9.0, 1.0, 7.0});
  CHECK(close(s.min, 1.0));
  CHECK(close(s.max, 9.0));
  CHECK(close(s.range, 8.0));
}

static void test_handles_negatives() {
  Stats s = compute_stats({-4.0, -1.0, -10.0});
  CHECK(close(s.min, -10.0));
  CHECK(close(s.max, -1.0));
  CHECK(close(s.mean, -5.0));
  CHECK(close(s.range, 9.0));
}

static void test_empty_input() {
  Stats s = compute_stats({});
  CHECK(close(s.mean, 0.0) && close(s.min, 0.0) && close(s.max, 0.0) && close(s.range, 0.0));
}

int main() {
  test_basic_mean();
  test_single_value();
  test_min_max_range();
  test_handles_negatives();
  test_empty_input();
  return REPORT();
}
