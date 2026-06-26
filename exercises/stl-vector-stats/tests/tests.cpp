// Tests for stl-vector-stats. Build with -I _harness and the impl dir.
#include <cmath>
#include <vector>

#include "check.hpp"
#include "vector_stats.hpp"

static bool near(double x, double y) { return std::fabs(x - y) < 1e-9; }

static void test_basic() {
  const VectorStats s = summarize(std::vector<int>{1, 2, 3, 4});
  CHECK(s.min == 1);
  CHECK(s.max == 4);
  CHECK(s.sum == 10);
  CHECK(near(s.mean, 2.5));
}

static void test_single() {
  const VectorStats s = summarize(std::vector<int>{7});
  CHECK(s.min == 7 && s.max == 7 && s.sum == 7);
  CHECK(near(s.mean, 7.0));
}

static void test_negatives() {
  const VectorStats s = summarize(std::vector<int>{-5, -1, -9, -3});
  CHECK(s.min == -9);
  CHECK(s.max == -1);
  CHECK(s.sum == -18);
  CHECK(near(s.mean, -4.5));
}

static void test_fractional_mean() {
  const VectorStats s = summarize(std::vector<int>{1, 2});
  CHECK(near(s.mean, 1.5));
}

static void test_large_sum_no_overflow() {
  const VectorStats s = summarize(std::vector<int>{2000000000, 2000000000, 2000000000});
  CHECK(s.sum == 6000000000LL);
  CHECK(s.max == 2000000000);
}

int main() {
  test_basic();
  test_single();
  test_negatives();
  test_fractional_mean();
  test_large_sum_no_overflow();
  return REPORT();
}
