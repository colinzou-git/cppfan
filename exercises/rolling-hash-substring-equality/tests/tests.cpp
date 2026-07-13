// Tests for rolling-hash-substring-equality. Build with -I _harness and impl dir.
#include <string>

#include "check.hpp"
#include "rolling_hash.hpp"

static void test_equal_substrings() {
  RollingHash h("ababcabab");
  CHECK(h.equal(0, 2, 2));   // "ab" == "ab"
  CHECK(h.equal(0, 5, 4));   // "abab" == "abab"
}

static void test_unequal_substrings() {
  RollingHash h("ababcabab");
  CHECK(!h.equal(0, 4, 1));  // 'a' != 'c'
  CHECK(!h.equal(1, 3, 3));  // "bab" != "bca"
}

static void test_zero_length_is_equal() {
  RollingHash h("hello");
  CHECK(h.equal(0, 3, 0));
  CHECK(h.equal(5, 5, 0));
}

static void test_out_of_range_is_false() {
  RollingHash h("hello");
  CHECK(!h.equal(0, 3, 3));   // b+len = 6 > 5
  CHECK(!h.equal(4, 0, 2));   // a+len = 6 > 5
}

static void test_full_string_self_equal() {
  RollingHash h("abcdefg");
  CHECK(h.equal(0, 0, 7));
}

static void test_repeated_blocks() {
  RollingHash h("xyxyxy");
  CHECK(h.equal(0, 2, 4));    // "xyxy" == "xyxy"
  CHECK(h.equal(0, 4, 2));    // "xy" == "xy"
  CHECK(!h.equal(0, 1, 2));   // "xy" != "yx"
}

int main() {
  test_equal_substrings();
  test_unequal_substrings();
  test_zero_length_is_equal();
  test_out_of_range_is_false();
  test_full_string_self_equal();
  test_repeated_blocks();
  return REPORT();
}
