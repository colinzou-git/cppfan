// Tests for dsa-valid-parentheses. Build with -I _harness and the impl dir.
#include <string>

#include "check.hpp"
#include "parentheses.hpp"

static void test_simple_balanced() {
  CHECK(is_balanced("()"));
  CHECK(is_balanced("()[]{}"));
  CHECK(is_balanced("{[]}"));
}

static void test_unbalanced() {
  CHECK(!is_balanced("(]"));
  CHECK(!is_balanced("([)]"));
  CHECK(!is_balanced("((("));
  CHECK(!is_balanced(")("));
}

static void test_empty() {
  CHECK(is_balanced(""));
}

static void test_ignores_other_chars() {
  CHECK(is_balanced("a(b)c"));
  CHECK(is_balanced("if (x) { y[0]; }"));
  CHECK(!is_balanced("a(b]c"));
}

static void test_closing_without_open() {
  CHECK(!is_balanced(")"));
  CHECK(!is_balanced("()]"));
}

int main() {
  test_simple_balanced();
  test_unbalanced();
  test_empty();
  test_ignores_other_chars();
  test_closing_without_open();
  return REPORT();
}
