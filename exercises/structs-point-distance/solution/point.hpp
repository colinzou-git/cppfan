// Reference solution for structs-point-distance.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <cmath>
#include <vector>

struct Point {
  double x;
  double y;

  double distance_to(const Point& other) const {
    const double dx = x - other.x;
    const double dy = y - other.y;
    return std::sqrt(dx * dx + dy * dy);
  }
};

inline double perimeter(const std::vector<Point>& polygon) {
  if (polygon.size() < 2) {
    return 0.0;
  }
  double total = 0.0;
  for (std::size_t i = 0; i < polygon.size(); ++i) {
    const Point& a = polygon[i];
    const Point& b = polygon[(i + 1) % polygon.size()];
    total += a.distance_to(b);
  }
  return total;
}
