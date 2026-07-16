// Tests for math-happy-number. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "is_happy.hpp"

static void test_happy() {
  CHECK(is_happy(19) == true);  // 1+81=82 -> 68 -> 100 -> 1
}

static void test_unhappy() {
  CHECK(is_happy(2) == false);
}

static void test_one() {
  CHECK(is_happy(1) == true);
}

static void test_seven() {
  CHECK(is_happy(7) == true);  // 7 -> 49 -> 97 -> 130 -> 10 -> 1
}

static void test_small_unhappy() {
  CHECK(is_happy(4) == false);  // enters the 4->16->37->58->89->145->42->20->4 cycle
}

int main() {
  test_happy();
  test_unhappy();
  test_one();
  test_seven();
  test_small_unhappy();
  return REPORT();
}
