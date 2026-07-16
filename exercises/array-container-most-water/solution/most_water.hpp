// Reference solution for array-container-most-water.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <vector>

// Largest container area min(height[i], height[j]) * (j - i) over all i < j.
//
// Contract:
//  - heights are non-negative; fewer than two lines hold no water (returns 0).
//  - the area can exceed INT_MAX, so it is computed and returned in 64-bit
//    (long long); at least one operand is promoted before the multiply so the
//    product never overflows a 32-bit int.
inline long long most_water(const std::vector<int>& height) {
  int i = 0;
  int j = static_cast<int>(height.size()) - 1;
  long long best = 0;
  while (i < j) {
    const long long area = 1LL * std::min(height[i], height[j]) * (j - i);
    best = std::max(best, area);
    if (height[i] < height[j]) {
      ++i;  // the shorter side caps the area; try to grow it
    } else {
      --j;
    }
  }
  return best;
}
