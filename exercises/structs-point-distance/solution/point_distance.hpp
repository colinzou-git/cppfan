#pragma once
struct Point { long long x = 0; long long y = 0; };
inline long long squared_distance(Point a, Point b){ long long dx=a.x-b.x; long long dy=a.y-b.y; return dx*dx+dy*dy; }
