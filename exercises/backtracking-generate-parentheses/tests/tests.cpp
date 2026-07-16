// Tests for backtracking-generate-parentheses. Build with -I _harness and impl.
#include "check.hpp"
#include "generate_parentheses.hpp"

#include <string>
#include <vector>

static void test_zero() {
  // n = 0: one combination, the empty string.
  CHECK(generate_parentheses(0) == std::vector<std::string>{""});
}

static void test_one() {
  CHECK(generate_parentheses(1) == std::vector<std::string>{"()"});
}

static void test_two() {
  CHECK(generate_parentheses(2) == (std::vector<std::string>{"(())", "()()"}));
}

static void test_three_count() {
  // The number of combinations is the n-th Catalan number: C(3) = 5.
  CHECK(generate_parentheses(3).size() == 5);
}

static void test_sorted() {
  auto combos = generate_parentheses(3);
  CHECK(combos.front() == "((()))");
  CHECK(combos.back() == "()()()");
}

int main() {
  test_zero();
  test_one();
  test_two();
  test_three_count();
  test_sorted();
  return REPORT();
}
