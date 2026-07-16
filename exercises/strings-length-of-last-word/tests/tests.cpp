// Tests for strings-length-of-last-word. Build with -I _harness and the impl dir.
#include <string>

#include "check.hpp"
#include "last_word_length.hpp"

static void test_basic() {
  CHECK(last_word_length("Hello World") == 5);
}

static void test_trailing_spaces() {
  CHECK(last_word_length("hello ") == 5);
  CHECK(last_word_length("   fly me   to   the moon  ") == 4);
}

static void test_multiple_spaces() {
  CHECK(last_word_length("luffy is still joyboy") == 6);
}

static void test_single_word() {
  CHECK(last_word_length("a") == 1);
  CHECK(last_word_length("  word") == 4);
}

static void test_no_words() {
  CHECK(last_word_length("") == 0);
  CHECK(last_word_length("     ") == 0);
}

int main() {
  test_basic();
  test_trailing_spaces();
  test_multiple_spaces();
  test_single_word();
  test_no_words();
  return REPORT();
}
