#include "check.hpp"
#include "release_acquire.hpp"
#include <vector>

static void test_zero_values() {
  CHECK(release_acquire_handoff(0).empty());
}
static void test_one_value() {
  CHECK(release_acquire_handoff(1) == (std::vector<int>{1}));
}
static void test_multiple_values() {
  CHECK(release_acquire_handoff(4) == (std::vector<int>{1, 4, 7, 10}));
}
static void test_negative_values() {
  CHECK(release_acquire_handoff(-1).empty());
}
static void test_full_payload_repeatable() {
  for (int run = 0; run < 12; ++run) {
    const auto observed = release_acquire_handoff(500);
    CHECK(observed.size() == 500);
    CHECK(observed.front() == 1);
    CHECK(observed.back() == 1498);
  }
}
int main() {
  test_zero_values();
  test_one_value();
  test_multiple_values();
  test_negative_values();
  test_full_payload_repeatable();
  return REPORT();
}
