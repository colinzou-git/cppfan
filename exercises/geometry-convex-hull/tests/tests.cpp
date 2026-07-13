// Tests for geometry-convex-hull. Build with -I _harness and the impl dir.
#include <algorithm>
#include <vector>

#include "check.hpp"
#include "convex_hull.hpp"

// Compare hulls as sorted vertex sets so any correct ordering passes.
static std::vector<Point> sorted_set(std::vector<Point> v) {
  std::sort(v.begin(), v.end(), [](const Point& a, const Point& b) {
    return a.x != b.x ? a.x < b.x : a.y < b.y;
  });
  return v;
}

static bool same_hull(std::vector<Point> got, std::vector<Point> expected) {
  return sorted_set(std::move(got)) == sorted_set(std::move(expected));
}

static void test_square_drops_interior() {
  std::vector<Point> pts{{0, 0}, {2, 0}, {2, 2}, {0, 2}, {1, 1}};
  CHECK(same_hull(convex_hull(pts), {{0, 0}, {2, 0}, {2, 2}, {0, 2}}));
}

static void test_drops_collinear_edge_point() {
  // (1,0) sits on the bottom edge and must be dropped.
  std::vector<Point> pts{{0, 0}, {1, 0}, {2, 0}, {2, 2}, {0, 2}};
  CHECK(same_hull(convex_hull(pts), {{0, 0}, {2, 0}, {2, 2}, {0, 2}}));
}

static void test_triangle() {
  std::vector<Point> pts{{0, 0}, {4, 0}, {2, 3}};
  CHECK(same_hull(convex_hull(pts), {{0, 0}, {4, 0}, {2, 3}}));
}

static void test_two_points() {
  std::vector<Point> pts{{1, 1}, {3, 4}};
  CHECK(same_hull(convex_hull(pts), {{1, 1}, {3, 4}}));
}

static void test_duplicates_collapse() {
  std::vector<Point> pts{{0, 0}, {0, 0}, {2, 0}, {2, 0}, {1, 2}};
  CHECK(same_hull(convex_hull(pts), {{0, 0}, {2, 0}, {1, 2}}));
}

static void test_pentagon_with_inner_cloud() {
  std::vector<Point> pts{{0, 0}, {4, 0}, {5, 3}, {2, 5}, {-1, 3},
                         {2, 2}, {3, 2}, {1, 3}, {2, 1}};
  CHECK(same_hull(convex_hull(pts), {{0, 0}, {4, 0}, {5, 3}, {2, 5}, {-1, 3}}));
}

int main() {
  test_square_drops_interior();
  test_drops_collinear_edge_point();
  test_triangle();
  test_two_points();
  test_duplicates_collapse();
  test_pentagon_with_inner_cloud();
  return REPORT();
}
