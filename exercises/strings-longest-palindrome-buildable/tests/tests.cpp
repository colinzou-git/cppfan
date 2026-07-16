// Tests for strings-longest-palindrome-buildable. Build with -I _harness + impl.
#include "check.hpp"
#include "longest_palindrome.hpp"

#include <string>

static void test_mixed_case() {
  // "abccccdd" -> "dccaccd" length 7 (a is the odd one out).
  CHECK(longest_palindrome("abccccdd") == 7);
}

static void test_all_pairs() {
  CHECK(longest_palindrome("aabb") == 4);
  CHECK(longest_palindrome("aaaa") == 4);
}

static void test_single_char() {
  CHECK(longest_palindrome("a") == 1);
}

static void test_one_odd() {
  CHECK(longest_palindrome("aaabb") == 5);   // aa b aa
  CHECK(longest_palindrome("abc") == 1);     // only one char can be central
}

static void test_empty() {
  CHECK(longest_palindrome("") == 0);
}

int main() {
  test_mixed_case();
  test_all_pairs();
  test_single_char();
  test_one_odd();
  test_empty();
  return REPORT();
}
