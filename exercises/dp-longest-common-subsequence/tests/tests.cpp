// Tests for dp-longest-common-subsequence. Build with -I _harness and impl dir.
#include <string>

#include "check.hpp"
#include "lcs.hpp"

static void test_classic() {
  CHECK(lcs_length("abcde", "ace") == 3);  // "ace"
}

static void test_identical() {
  CHECK(lcs_length("abc", "abc") == 3);
}

static void test_disjoint() {
  CHECK(lcs_length("abc", "def") == 0);
}

static void test_empty() {
  CHECK(lcs_length("", "") == 0);
  CHECK(lcs_length("abc", "") == 0);
  CHECK(lcs_length("", "abc") == 0);
}

static void test_interleaved() {
  CHECK(lcs_length("aggtab", "gxtxayb") == 4);  // "gtab"
}

static void test_repeated_chars() {
  CHECK(lcs_length("aaaa", "aa") == 2);
}

int main() {
  test_classic();
  test_identical();
  test_disjoint();
  test_empty();
  test_interleaved();
  test_repeated_chars();
  return REPORT();
}
