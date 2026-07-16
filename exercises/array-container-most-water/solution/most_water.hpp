// Reference solution for array-container-most-water.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <vector>

inline int most_water(const std::vector<int>& height) {
  int i = 0;
  int j = static_cast<int>(height.size()) - 1;
  int best = 0;
  while (i < j) {
    int area = std::min(height[i], height[j]) * (j - i);
    best = std::max(best, area);
    if (height[i] < height[j]) {
      ++i;  // the shorter side caps the area; try to grow it
    } else {
      --j;
    }
  }
  return best;
}
