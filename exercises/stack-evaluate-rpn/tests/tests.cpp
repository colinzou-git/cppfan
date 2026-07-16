// Tests for stack-evaluate-rpn. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "evaluate_rpn.hpp"

#include <string>
#include <vector>

using Tokens = std::vector<std::string>;

static void test_basic() {
  CHECK(evaluate_rpn(Tokens{"2", "1", "+", "3", "*"}) == 9);  // (2+1)*3
}

static void test_precedence_free() {
  CHECK(evaluate_rpn(Tokens{"4", "13", "5", "/", "+"}) == 6);  // 4 + (13/5)
}

static void test_division_truncates() {
  CHECK(evaluate_rpn(Tokens{"7", "2", "/"}) == 3);
  CHECK(evaluate_rpn(Tokens{"10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"}) == 22);
}

static void test_single() {
  CHECK(evaluate_rpn(Tokens{"42"}) == 42);
}

static void test_negatives() {
  CHECK(evaluate_rpn(Tokens{"3", "-4", "*"}) == -12);
  CHECK(evaluate_rpn(Tokens{"5", "8", "-"}) == -3);
}

int main() {
  test_basic();
  test_precedence_free();
  test_division_truncates();
  test_single();
  test_negatives();
  return REPORT();
}
