// Tests for chrono-rate-limiter-sim. Build with -I _harness and the impl dir.
#include <vector>

#include "check.hpp"
#include "rate_limiter.hpp"

using B = std::vector<bool>;

static void test_basic_window() {
  std::vector<long long> t{0, 100, 200, 300, 1000};
  CHECK((rate_limit(t, 3, 1000) == B{true, true, true, false, true}));
}

static void test_limit_one() {
  std::vector<long long> t{0, 500, 1500};
  CHECK((rate_limit(t, 1, 1000) == B{true, false, true}));
}

static void test_all_allowed_when_spaced() {
  std::vector<long long> t{0, 1000, 2000, 3000};
  CHECK((rate_limit(t, 1, 1000) == B{true, true, true, true}));
}

static void test_burst_throttled() {
  std::vector<long long> t{0, 1, 2, 3, 4};
  CHECK((rate_limit(t, 2, 100) == B{true, true, false, false, false}));
}

static void test_empty() {
  CHECK(rate_limit({}, 3, 1000).empty());
}

static void test_window_boundary_evicts() {
  // Second request at exactly t - window from a prior one -> the prior evicts.
  std::vector<long long> t{0, 1000};
  CHECK((rate_limit(t, 1, 1000) == B{true, true}));
}

int main() {
  test_basic_window();
  test_limit_one();
  test_all_allowed_when_spaced();
  test_burst_throttled();
  test_empty();
  test_window_boundary_evicts();
  return REPORT();
}
