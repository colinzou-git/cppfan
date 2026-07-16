// Exercise: array-container-most-water
// Each element is a vertical line height. Choose two lines that, with the x-axis,
// form a container holding the most water. Return that maximum area.
//
// Rules:
//  - `most_water(height)` returns the largest min(h[i], h[j]) * (j - i).
//  - Two pointers from the ends; move the pointer at the shorter line inward.
//  - Fewer than two lines hold no water (area 0).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline int most_water(const std::vector<int>& height) {
  // TODO: two pointers; track the maximum area; move the shorter side inward.
  (void)height;
  return 0;
}
