// Tests for input-validation-menu-loop. Build with -I _harness and impl dir.
#include <string>
#include <vector>

#include "check.hpp"
#include "menu.hpp"

using S = std::vector<std::string>;

static void test_skips_invalid_then_takes_valid() {
  CHECK(first_valid_choice({"7", "abc", "3", "1"}) == 3);
}

static void test_none_valid() {
  CHECK(first_valid_choice({"0", "5", "9", "x"}) == -1);
}

static void test_single_valid() {
  CHECK(first_valid_choice({"2"}) == 2);
}

static void test_empty_list() {
  CHECK(first_valid_choice({}) == -1);
}

static void test_rejects_trailing_and_spaces() {
  CHECK(first_valid_choice({"4a", " 3", "4"}) == 4);
}

static void test_boundaries() {
  CHECK(first_valid_choice({"1"}) == 1);
  CHECK(first_valid_choice({"4"}) == 4);
  CHECK(first_valid_choice({"5", "0", "-1"}) == -1);
}

int main() {
  test_skips_invalid_then_takes_valid();
  test_none_valid();
  test_single_valid();
  test_empty_list();
  test_rejects_trailing_and_spaces();
  test_boundaries();
  return REPORT();
}
