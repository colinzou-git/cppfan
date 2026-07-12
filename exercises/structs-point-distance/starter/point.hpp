// Exercise: structs-point-distance
// Define a small Point struct with a const method, and a free function that
// walks a polygon.
//
// Rules:
//  - Point has public double fields x and y.
//  - distance_to(other) is a CONST method returning the Euclidean distance
//    sqrt((x - other.x)^2 + (y - other.y)^2).
//  - perimeter(polygon) sums the edge lengths around a closed polygon: the last
//    vertex connects back to the first. Fewer than 2 points -> 0.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <cmath>
#include <vector>

struct Point {
  double x;
  double y;

  double distance_to(const Point& other) const {
    // TODO: return the Euclidean distance between *this and other.
    (void)other;
    return 0.0;
  }
};

inline double perimeter(const std::vector<Point>& polygon) {
  // TODO: sum edge lengths, wrapping the last vertex back to the first.
  (void)polygon;
  return 0.0;
}
