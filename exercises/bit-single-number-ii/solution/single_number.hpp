// Reference solution for bit-single-number-ii.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <cstdint>
#include <vector>

inline int single_number(const std::vector<int>& nums) {
  uint32_t result = 0;
  for (int bit = 0; bit < 32; ++bit) {
    int count = 0;
    for (int value : nums) {
      count += (static_cast<uint32_t>(value) >> bit) & 1u;
    }
    if (count % 3 != 0) {
      result |= (1u << bit);
    }
  }
  return static_cast<int>(result);
}
