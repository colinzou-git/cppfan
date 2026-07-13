// Exercise: geometry-segment-intersection
// Decide whether two closed line segments intersect.
//
// Rules:
//  - Points have integer coordinates. Return true when segments p1-p2 and p3-p4
//    share at least one point, including:
//      * a proper crossing,
//      * touching at an endpoint,
//      * collinear overlap.
//  - Return false when they are disjoint (including collinear but separated).
//  - Use the orientation (cross-product) test; keep it integer-only (no floats)
//    to stay exact.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <algorithm>

struct Point {
  long long x;
  long long y;
};

inline bool segments_intersect(Point p1, Point p2, Point p3, Point p4) {
  // TODO: compute the four orientations; handle the proper-crossing case and the
  // collinear on-segment cases.
  (void)p1;
  (void)p2;
  (void)p3;
  (void)p4;
  return false;
}
