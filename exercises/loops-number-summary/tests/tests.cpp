#include "check.hpp"
#include "number_summary.hpp"
#include <vector>

void test_empty_summary() {
  auto s = summarizeNumbers({});
  CHECK(s.empty); CHECK(s.sum == 0); CHECK(s.evenCount == 0);
}
void test_mixed_values() {
  auto s = summarizeNumbers({5, -2, 0, 7, 4});
  CHECK(!s.empty); CHECK(s.min == -2); CHECK(s.max == 7); CHECK(s.sum == 14); CHECK(s.evenCount == 3);
}
void test_single_negative() { auto s = summarizeNumbers({-9}); CHECK(!s.empty); CHECK(s.min == -9); CHECK(s.max == -9); CHECK(s.sum == -9); CHECK(s.evenCount == 0); }
void test_all_even() { auto s = summarizeNumbers({2, 4, 6}); CHECK(s.evenCount == 3); CHECK(s.sum == 12); }
int main(){ test_empty_summary(); test_mixed_values(); test_single_negative(); test_all_even(); return REPORT(); }
