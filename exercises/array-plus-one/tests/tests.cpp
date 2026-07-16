// Tests for array-plus-one. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "plus_one.hpp"

#include <vector>

static void test_no_carry() {
  CHECK(plus_one(std::vector<int>{1, 2, 3}) == (std::vector<int>{1, 2, 4}));
}

static void test_single_carry() {
  CHECK(plus_one(std::vector<int>{1, 2, 9}) == (std::vector<int>{1, 3, 0}));
}

static void test_all_nines() {
  CHECK(plus_one(std::vector<int>{9, 9, 9}) == (std::vector<int>{1, 0, 0, 0}));
}

static void test_single_digit() {
  CHECK(plus_one(std::vector<int>{0}) == (std::vector<int>{1}));
  CHECK(plus_one(std::vector<int>{9}) == (std::vector<int>{1, 0}));
}

static void test_middle_carry() {
  CHECK(plus_one(std::vector<int>{2, 9, 9}) == (std::vector<int>{3, 0, 0}));
}

int main() {
  test_no_carry();
  test_single_carry();
  test_all_nines();
  test_single_digit();
  test_middle_carry();
  return REPORT();
}
