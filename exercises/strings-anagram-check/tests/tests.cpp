// Tests for strings-anagram-check. Build with -I _harness and the impl dir.
#include <string>

#include "check.hpp"
#include "anagram.hpp"

static void test_basic_anagrams() {
  CHECK(are_anagrams("listen", "silent"));
  CHECK(are_anagrams("evil", "vile"));
}

static void test_not_anagrams() {
  CHECK(!are_anagrams("hello", "world"));
  CHECK(!are_anagrams("abc", "abcd"));
}

static void test_ignores_case() {
  CHECK(are_anagrams("Dormitory", "Dirty Room"));  // also ignores the space
  CHECK(are_anagrams("Listen", "SILENT"));
}

static void test_ignores_spaces() {
  CHECK(are_anagrams("conversation", "voices rant on"));
  CHECK(are_anagrams("a b c", "cba"));
}

static void test_empty_and_spaces() {
  CHECK(are_anagrams("", ""));
  CHECK(are_anagrams("   ", ""));
}

static void test_counts_matter() {
  CHECK(!are_anagrams("aab", "abb"));
  CHECK(are_anagrams("aabb", "bbaa"));
}

int main() {
  test_basic_anagrams();
  test_not_anagrams();
  test_ignores_case();
  test_ignores_spaces();
  test_empty_and_spaces();
  test_counts_matter();
  return REPORT();
}
