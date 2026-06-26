// Tests for strings-longest-unique-substring. Build with -I _harness and impl dir.
#include <string>

#include "check.hpp"
#include "longest_unique.hpp"

static void test_classic() {
  CHECK(longest_unique_substring("abcabcbb") == 3);  // "abc"
  CHECK(longest_unique_substring("pwwkew") == 3);    // "wke"
}

static void test_all_same() {
  CHECK(longest_unique_substring("bbbbb") == 1);
}

static void test_all_unique() {
  CHECK(longest_unique_substring("abcdef") == 6);
}

static void test_empty_and_single() {
  CHECK(longest_unique_substring("") == 0);
  CHECK(longest_unique_substring("a") == 1);
}

static void test_repeat_resets_window() {
  CHECK(longest_unique_substring("abba") == 2);   // "ab" or "ba"
  CHECK(longest_unique_substring("dvdf") == 3);   // "vdf"
}

static void test_with_spaces_and_digits() {
  CHECK(longest_unique_substring("a1 a1 ") == 3);  // "a1 "
}

int main() {
  test_classic();
  test_all_same();
  test_all_unique();
  test_empty_and_single();
  test_repeat_resets_window();
  test_with_spaces_and_digits();
  return REPORT();
}
