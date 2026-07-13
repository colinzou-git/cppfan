// Reference solution for geometry-convex-hull.
// Kept out of the learner-facing default path; do not reveal before completion.
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

// Cross product of OA x OB.
inline long long cross(const Point& o, const Point& a, const Point& b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

// Convex hull (counter-clockwise, starting at the lowest-then-leftmost point)
// via Andrew's monotone chain. Interior and boundary-collinear points are
// dropped; the first vertex is not repeated at the end.
inline std::vector<Point> convex_hull(std::vector<Point> points) {
  std::sort(points.begin(), points.end(), [](const Point& a, const Point& b) {
    return a.x != b.x ? a.x < b.x : a.y < b.y;
  });
  points.erase(std::unique(points.begin(), points.end()), points.end());
  const int n = static_cast<int>(points.size());
  if (n < 3) {
    return points;
  }

  std::vector<Point> hull(2 * n);
  int k = 0;
  for (int i = 0; i < n; ++i) {  // lower hull
    while (k >= 2 && cross(hull[k - 2], hull[k - 1], points[i]) <= 0) {
      --k;
    }
    hull[k++] = points[i];
  }
  const int lower = k + 1;
  for (int i = n - 2; i >= 0; --i) {  // upper hull
    while (k >= lower && cross(hull[k - 2], hull[k - 1], points[i]) <= 0) {
      --k;
    }
    hull[k++] = points[i];
  }
  hull.resize(k - 1);
  return hull;
}
