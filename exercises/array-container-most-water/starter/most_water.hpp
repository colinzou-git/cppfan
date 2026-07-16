// Exercise: array-container-most-water
// Each element is a vertical line height. Choose two lines that, with the x-axis,
// form a container holding the most water. Return that maximum area.
//
// Rules:
//  - `most_water(height)` returns the largest min(h[i], h[j]) * (j - i).
//  - Two pointers from the ends; move the pointer at the shorter line inward.
//  - Heights are non-negative; fewer than two lines hold no water (area 0).
//  - The area can exceed INT_MAX, so return 64-bit (long long) and promote one
//    operand before multiplying (e.g. `1LL * min(...) * (j - i)`).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline long long most_water(const std::vector<int>& height) {
  // TODO: two pointers; track the maximum area; move the shorter side inward.
  (void)height;
  return 0;
}
