// Exercise: geometry-convex-hull
// Compute the convex hull of a set of 2-D points.
//
// Rules:
//  - Return the vertices of the convex hull (the smallest convex polygon that
//    contains all points).
//  - Drop interior points AND points that lie on the interior of a hull edge
//    (only true corners remain).
//  - With fewer than 3 distinct points, return the distinct points themselves.
//  - The tests compare the hull as an unordered set of vertices, so any correct
//    winding/order is accepted (Andrew's monotone chain is a clean approach).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <algorithm>
#include <vector>

struct Point {
  long long x;
  long long y;
};

inline bool operator==(const Point& a, const Point& b) {
  return a.x == b.x && a.y == b.y;
}

inline std::vector<Point> convex_hull(std::vector<Point> points) {
  // TODO: sort points, build the lower and upper chains with a cross-product
  // turn test, and return the hull vertices.
  (void)points;
  return {};
}
