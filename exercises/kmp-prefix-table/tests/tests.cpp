// Tests for kmp-prefix-table. Build with -I _harness and the impl dir.
#include <string>
#include <vector>

#include "check.hpp"
#include "prefix_table.hpp"

using Lps = std::vector<int>;

static void test_empty() {
  CHECK(prefix_function("").empty());
}

static void test_single_char() {
  CHECK((prefix_function("a") == Lps{0}));
}

static void test_all_same() {
  CHECK((prefix_function("aaaa") == Lps{0, 1, 2, 3}));
}

static void test_no_repeats() {
  CHECK((prefix_function("abcdef") == Lps{0, 0, 0, 0, 0, 0}));
}

static void test_periodic() {
  CHECK((prefix_function("abcabc") == Lps{0, 0, 0, 1, 2, 3}));
}

static void test_overlapping() {
  CHECK((prefix_function("abacaba") == Lps{0, 0, 1, 0, 1, 2, 3}));
}

static void test_fallback_case() {
  CHECK((prefix_function("aabaaab") == Lps{0, 1, 0, 1, 2, 2, 3}));
}

int main() {
  test_empty();
  test_single_char();
  test_all_same();
  test_no_repeats();
  test_periodic();
  test_overlapping();
  test_fallback_case();
  return REPORT();
}
