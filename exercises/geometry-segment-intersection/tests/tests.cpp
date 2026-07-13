// Tests for geometry-segment-intersection. Build with -I _harness and impl dir.
#include "check.hpp"
#include "segment_intersection.hpp"

static void test_proper_cross() {
  CHECK(segments_intersect({0, 0}, {4, 4}, {0, 4}, {4, 0}));
}

static void test_parallel_apart() {
  CHECK(!segments_intersect({0, 0}, {4, 0}, {0, 1}, {4, 1}));
}

static void test_touch_at_endpoint() {
  CHECK(segments_intersect({0, 0}, {2, 2}, {2, 2}, {4, 0}));
}

static void test_t_junction() {
  CHECK(segments_intersect({0, 0}, {4, 0}, {2, 0}, {2, 4}));
}

static void test_collinear_overlap() {
  CHECK(segments_intersect({0, 0}, {4, 0}, {2, 0}, {6, 0}));
}

static void test_collinear_disjoint() {
  CHECK(!segments_intersect({0, 0}, {2, 0}, {4, 0}, {6, 0}));
}

static void test_disjoint_general() {
  CHECK(!segments_intersect({0, 0}, {1, 1}, {2, 0}, {3, 1}));
}

int main() {
  test_proper_cross();
  test_parallel_apart();
  test_touch_at_endpoint();
  test_t_junction();
  test_collinear_overlap();
  test_collinear_disjoint();
  test_disjoint_general();
  return REPORT();
}
