// Tests for stack-min-stack. Build with -I _harness and the impl dir.
#include "check.hpp"
#include "min_stack.hpp"

static void test_push_top_min() {
  MinStack s;
  s.push(3);
  CHECK(s.top() == 3);
  CHECK(s.get_min() == 3);
}

static void test_min_tracks_smaller() {
  MinStack s;
  s.push(3);
  s.push(5);
  CHECK(s.get_min() == 3);
  s.push(2);
  CHECK(s.get_min() == 2);
  CHECK(s.top() == 2);
}

static void test_pop_restores_min() {
  MinStack s;
  s.push(3);
  s.push(2);
  s.push(5);
  CHECK(s.get_min() == 2);
  s.pop();  // remove 5
  CHECK(s.get_min() == 2);
  s.pop();  // remove 2
  CHECK(s.get_min() == 3);
  CHECK(s.top() == 3);
}

static void test_duplicate_minimums() {
  MinStack s;
  s.push(2);
  s.push(2);
  s.pop();
  CHECK(s.get_min() == 2);  // still one 2 left
}

static void test_empty_and_size() {
  MinStack s;
  CHECK(s.empty());
  CHECK(s.size() == 0);
  s.push(1);
  s.push(2);
  CHECK(!s.empty());
  CHECK(s.size() == 2);
}

static void test_negative_values() {
  MinStack s;
  s.push(-1);
  s.push(-5);
  s.push(3);
  CHECK(s.get_min() == -5);
}

int main() {
  test_push_top_min();
  test_min_tracks_smaller();
  test_pop_restores_min();
  test_duplicate_minimums();
  test_empty_and_size();
  test_negative_values();
  return REPORT();
}
