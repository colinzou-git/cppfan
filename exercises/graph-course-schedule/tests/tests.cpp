// Tests for graph-course-schedule. Build with -I _harness and the impl dir.
#include <utility>
#include <vector>

#include "check.hpp"
#include "course_schedule.hpp"

using Edges = std::vector<std::pair<int, int>>;

static void test_simple_chain_ok() {
  CHECK(can_finish(2, Edges{{1, 0}}));
}

static void test_two_course_cycle() {
  CHECK(!can_finish(2, Edges{{1, 0}, {0, 1}}));
}

static void test_long_chain_ok() {
  CHECK(can_finish(4, Edges{{1, 0}, {2, 1}, {3, 2}}));
}

static void test_three_course_cycle() {
  CHECK(!can_finish(3, Edges{{0, 1}, {1, 2}, {2, 0}}));
}

static void test_no_prereqs() {
  CHECK(can_finish(3, Edges{}));
}

static void test_diamond_ok() {
  // 0 -> 1, 0 -> 2, 1 -> 3, 2 -> 3 (as {a,b} = b before a)
  CHECK(can_finish(4, Edges{{1, 0}, {2, 0}, {3, 1}, {3, 2}}));
}

static void test_self_loop_is_cycle() {
  CHECK(!can_finish(1, Edges{{0, 0}}));
}

int main() {
  test_simple_chain_ok();
  test_two_course_cycle();
  test_long_chain_ok();
  test_three_course_cycle();
  test_no_prereqs();
  test_diamond_ok();
  test_self_loop_is_cycle();
  return REPORT();
}
