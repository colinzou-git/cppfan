// Tests for strings-reverse-words. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "reverse_words.hpp"

#include <string>

static void test_basic() {
  CHECK(reverse_words("the sky is blue") == "blue is sky the");
}

static void test_extra_spaces() {
  CHECK(reverse_words("a good   example") == "example good a");
}

static void test_single_word() {
  CHECK(reverse_words("hello") == "hello");
}

static void test_empty() {
  CHECK(reverse_words("") == "");
  CHECK(reverse_words("     ") == "");
}

static void test_leading_trailing() {
  CHECK(reverse_words("  hello world  ") == "world hello");
}

int main() {
  test_basic();
  test_extra_spaces();
  test_single_word();
  test_empty();
  test_leading_trailing();
  return REPORT();
}
