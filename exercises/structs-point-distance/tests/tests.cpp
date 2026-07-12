// Tests for structs-point-distance. Build with -I _harness and the impl dir.
#include <cmath>
#include <vector>

#include "check.hpp"
#include "point.hpp"

static bool close(double a, double b) {
  return std::fabs(a - b) < 1e-9;
}

static void test_distance_horizontal() {
  Point a{0.0, 0.0};
  Point b{3.0, 0.0};
  CHECK(close(a.distance_to(b), 3.0));
}

static void test_distance_pythagorean() {
  Point a{0.0, 0.0};
  Point b{3.0, 4.0};
  CHECK(close(a.distance_to(b), 5.0));
}

static void test_distance_is_symmetric() {
  Point a{1.0, 2.0};
  Point b{4.0, 6.0};
  CHECK(close(a.distance_to(b), b.distance_to(a)));
}

static void test_distance_to_self_is_zero() {
  Point a{7.0, -2.0};
  CHECK(close(a.distance_to(a), 0.0));
}

static void test_perimeter_unit_square() {
  std::vector<Point> square{{0.0, 0.0}, {1.0, 0.0}, {1.0, 1.0}, {0.0, 1.0}};
  CHECK(close(perimeter(square), 4.0));
}

static void test_perimeter_degenerate() {
  CHECK(close(perimeter({}), 0.0));
  CHECK(close(perimeter({{2.0, 3.0}}), 0.0));
}

int main() {
  test_distance_horizontal();
  test_distance_pythagorean();
  test_distance_is_symmetric();
  test_distance_to_self_is_zero();
  test_perimeter_unit_square();
  test_perimeter_degenerate();
  return REPORT();
}
