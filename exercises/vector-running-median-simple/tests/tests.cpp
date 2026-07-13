// Tests for vector-running-median-simple. Build with -I _harness and impl dir.
#include <cmath>
#include <vector>

#include "check.hpp"
#include "running_median.hpp"

static bool close_all(const std::vector<double>& got, const std::vector<double>& want) {
  if (got.size() != want.size()) {
    return false;
  }
  for (std::size_t i = 0; i < got.size(); ++i) {
    if (std::fabs(got[i] - want[i]) > 1e-9) {
      return false;
    }
  }
  return true;
}

static void test_increasing() {
  CHECK(close_all(running_medians({1, 2, 3, 4}), {1.0, 1.5, 2.0, 2.5}));
}

static void test_unsorted() {
  CHECK(close_all(running_medians({3, 1, 2}), {3.0, 2.0, 2.0}));
}

static void test_single() {
  CHECK(close_all(running_medians({5}), {5.0}));
}

static void test_empty() {
  CHECK(running_medians({}).empty());
}

static void test_duplicates() {
  CHECK(close_all(running_medians({2, 2, 2, 2}), {2.0, 2.0, 2.0, 2.0}));
}

static void test_mixed_stream() {
  CHECK(close_all(running_medians({1, 5, 2, 8, 7}), {1.0, 3.0, 2.0, 3.5, 5.0}));
}

int main() {
  test_increasing();
  test_unsorted();
  test_single();
  test_empty();
  test_duplicates();
  test_mixed_stream();
  return REPORT();
}
