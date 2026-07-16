// Tests for array-majority-element. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "majority_element.hpp"

#include <vector>

static void test_simple() {
  CHECK(majority_element(std::vector<int>{3, 2, 3}) == 3);
  CHECK(majority_element(std::vector<int>{2, 2, 1, 1, 1, 2, 2}) == 2);
}

static void test_single() {
  CHECK(majority_element(std::vector<int>{7}) == 7);
}

static void test_all_same() {
  CHECK(majority_element(std::vector<int>{5, 5, 5, 5}) == 5);
}

static void test_exact_majority() {
  // 4 of 7 elements are 9 (more than n/2).
  CHECK(majority_element(std::vector<int>{9, 1, 9, 2, 9, 3, 9}) == 9);
}

static void test_negatives() {
  CHECK(majority_element(std::vector<int>{-1, -1, -1, 2, 3}) == -1);
}

int main() {
  test_simple();
  test_single();
  test_all_same();
  test_exact_majority();
  test_negatives();
  return REPORT();
}
