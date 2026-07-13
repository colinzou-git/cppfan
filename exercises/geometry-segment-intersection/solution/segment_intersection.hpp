// Reference solution for geometry-segment-intersection.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>

struct Point {
  long long x;
  long long y;
};

// Cross product of (a-o) x (b-o).
inline long long cross(Point o, Point a, Point b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

inline int sign(long long v) {
  return (v > 0) - (v < 0);
}

// Is q within the axis-aligned bounding box of segment p-r (used when collinear)?
inline bool on_segment(Point p, Point q, Point r) {
  return std::min(p.x, r.x) <= q.x && q.x <= std::max(p.x, r.x) &&
         std::min(p.y, r.y) <= q.y && q.y <= std::max(p.y, r.y);
}

// Do closed segments p1-p2 and p3-p4 intersect (including touching/collinear overlap)?
inline bool segments_intersect(Point p1, Point p2, Point p3, Point p4) {
  const int d1 = sign(cross(p3, p4, p1));
  const int d2 = sign(cross(p3, p4, p2));
  const int d3 = sign(cross(p1, p2, p3));
  const int d4 = sign(cross(p1, p2, p4));

  if (d1 != d2 && d3 != d4) {
    return true;  // proper crossing
  }
  if (d1 == 0 && on_segment(p3, p1, p4)) {
    return true;
  }
  if (d2 == 0 && on_segment(p3, p2, p4)) {
    return true;
  }
  if (d3 == 0 && on_segment(p1, p3, p2)) {
    return true;
  }
  if (d4 == 0 && on_segment(p1, p4, p2)) {
    return true;
  }
  return false;
}
