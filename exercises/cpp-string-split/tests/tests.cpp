// Tests for cpp-string-split. Build with -I _harness and the impl dir.
#include <string>
#include <vector>

#include "check.hpp"
#include "split.hpp"

static void test_basic() {
  const std::vector<std::string> r = split("a,b,c", ',');
  CHECK((r == std::vector<std::string>{"a", "b", "c"}));
}

static void test_empty_fields() {
  CHECK((split("a,,b", ',') == std::vector<std::string>{"a", "", "b"}));
}

static void test_leading_trailing_delims() {
  CHECK((split(",a,", ',') == std::vector<std::string>{"", "a", ""}));
}

static void test_no_delim() {
  CHECK((split("hello", ',') == std::vector<std::string>{"hello"}));
}

static void test_empty_string() {
  CHECK((split("", ',') == std::vector<std::string>{""}));
}

static void test_other_delimiter() {
  CHECK((split("a b c", ' ') == std::vector<std::string>{"a", "b", "c"}));
}

int main() {
  test_basic();
  test_empty_fields();
  test_leading_trailing_delims();
  test_no_delim();
  test_empty_string();
  test_other_delimiter();
  return REPORT();
}
