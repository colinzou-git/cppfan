// Tests for dp-edit-distance. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "edit_distance.hpp"

#include <string>

static void test_equal() {
  CHECK(edit_distance("abc", "abc") == 0);
  CHECK(edit_distance("", "") == 0);
}

static void test_one_empty() {
  CHECK(edit_distance("abc", "") == 3);
  CHECK(edit_distance("", "hello") == 5);
}

static void test_replace() {
  CHECK(edit_distance("cat", "cut") == 1);
  CHECK(edit_distance("abc", "xyz") == 3);
}

static void test_mixed() {
  CHECK(edit_distance("sunday", "saturday") == 3);
}

static void test_classic() {
  CHECK(edit_distance("horse", "ros") == 3);
  CHECK(edit_distance("intention", "execution") == 5);
}

int main() {
  test_equal();
  test_one_empty();
  test_replace();
  test_mixed();
  test_classic();
  return REPORT();
}
