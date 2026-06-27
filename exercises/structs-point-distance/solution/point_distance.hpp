#pragma once

struct Point {
  long long x = 0;
  long long y = 0;
};

inline long long squared_distance(Point a, Point b) {
  const long long delta_x = a.x - b.x;
  const long long delta_y = a.y - b.y;
  return delta_x * delta_x + delta_y * delta_y;
}
