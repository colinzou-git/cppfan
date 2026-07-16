// Tests for dp-word-break. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "word_break.hpp"

#include <string>
#include <vector>

static void test_simple() {
  CHECK(word_break("leetcode", std::vector<std::string>{"leet", "code"}) == true);
}

static void test_reuse() {
  CHECK(word_break("applepenapple", std::vector<std::string>{"apple", "pen"}) == true);
}

static void test_unbreakable() {
  CHECK(word_break("catsandog", std::vector<std::string>{"cats", "dog", "sand", "and", "cat"}) == false);
}

static void test_empty() {
  CHECK(word_break("", std::vector<std::string>{"a"}) == true);
}

static void test_full_word() {
  CHECK(word_break("apple", std::vector<std::string>{"apple"}) == true);
  CHECK(word_break("apple", std::vector<std::string>{"app"}) == false);
}

int main() {
  test_simple();
  test_reuse();
  test_unbreakable();
  test_empty();
  test_full_word();
  return REPORT();
}
