// Tests for strings-is-subsequence. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "is_subsequence.hpp"

#include <string>

static void test_true() {
  CHECK(is_subsequence("abc", "ahbgdc") == true);
  CHECK(is_subsequence("ace", "abcde") == true);
}

static void test_false() {
  CHECK(is_subsequence("axc", "ahbgdc") == false);
  CHECK(is_subsequence("aec", "abcde") == false);
}

static void test_empty_s() {
  CHECK(is_subsequence("", "abc") == true);
  CHECK(is_subsequence("", "") == true);
}

static void test_equal() {
  CHECK(is_subsequence("abc", "abc") == true);
  CHECK(is_subsequence("abcd", "abc") == false);  // s longer than t
}

static void test_order_matters() {
  CHECK(is_subsequence("ba", "ab") == false);
}

int main() {
  test_true();
  test_false();
  test_empty_s();
  test_equal();
  test_order_matters();
  return REPORT();
}
