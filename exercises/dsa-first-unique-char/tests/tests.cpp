// Tests for dsa-first-unique-char. Build with -I _harness and the impl dir.
#include <string>

#include "check.hpp"
#include "first_unique.hpp"

static void test_first_char_unique() {
  CHECK(first_unique_index("leetcode") == 0);  // 'l'
}

static void test_later_unique() {
  CHECK(first_unique_index("loveleetcode") == 2);  // 'v'
}

static void test_none_unique() {
  CHECK(first_unique_index("aabb") == -1);
  CHECK(first_unique_index("aabbccdd") == -1);
}

static void test_empty_and_single() {
  CHECK(first_unique_index("") == -1);
  CHECK(first_unique_index("x") == 0);
}

static void test_unique_at_end() {
  CHECK(first_unique_index("aabbc") == 4);  // 'c'
}

static void test_mixed_chars() {
  CHECK(first_unique_index("a a") == 1);  // the space is unique
}

int main() {
  test_first_char_unique();
  test_later_unique();
  test_none_unique();
  test_empty_and_single();
  test_unique_at_end();
  test_mixed_chars();
  return REPORT();
}
