// Tests for value-semantics-deep-copy-buffer. Build with -I _harness and impl dir.
#include <utility>

#include "check.hpp"
#include "buffer.hpp"

static void test_construct_zeroed() {
  Buffer b(3);
  CHECK(b.size() == 3);
  if (b.size() == 3) {
    CHECK(b.at(0) == 0 && b.at(1) == 0 && b.at(2) == 0);
  }
}

static void test_deep_copy_is_independent() {
  Buffer a(3);
  a.at(0) = 1;
  a.at(1) = 2;
  a.at(2) = 3;
  Buffer b(a);
  CHECK(b.size() == 3);
  if (b.size() == 3) {
    CHECK(b.at(0) == 1 && b.at(1) == 2 && b.at(2) == 3);
    b.at(0) = 99;
    CHECK(a.at(0) == 1);  // original untouched
  }
}

static void test_copy_assignment_independent() {
  Buffer a(2);
  a.at(0) = 5;
  a.at(1) = 6;
  Buffer b(1);
  b = a;
  CHECK(b.size() == 2);
  if (b.size() == 2) {
    b.at(1) = -1;
    CHECK(a.at(1) == 6);
  }
}

static void test_self_assignment_safe() {
  Buffer a(2);
  a.at(0) = 7;
  a.at(1) = 8;
  a = a;  // must not corrupt or free-in-use
  CHECK(a.size() == 2);
  if (a.size() == 2) {
    CHECK(a.at(0) == 7 && a.at(1) == 8);
  }
}

static void test_move_transfers() {
  Buffer a(3);
  a.at(2) = 42;
  Buffer b(std::move(a));
  CHECK(b.size() == 3);
  CHECK(a.size() == 0);  // moved-from is empty
  if (b.size() == 3) {
    CHECK(b.at(2) == 42);
  }
}

static void test_move_assignment_transfers() {
  Buffer a(2);
  a.at(0) = 11;
  Buffer b(5);
  b = std::move(a);
  CHECK(b.size() == 2);
  CHECK(a.size() == 0);
  if (b.size() == 2) {
    CHECK(b.at(0) == 11);
  }
}

int main() {
  test_construct_zeroed();
  test_deep_copy_is_independent();
  test_copy_assignment_independent();
  test_self_assignment_safe();
  test_move_transfers();
  test_move_assignment_transfers();
  return REPORT();
}
