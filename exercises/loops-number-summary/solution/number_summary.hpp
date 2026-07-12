// Reference solution for loops-number-summary.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

struct NumberSummary {
  int count;
  long long sum;
  int min;
  int max;
  int even_count;
};

inline NumberSummary summarize(const std::vector<int>& nums) {
  NumberSummary s{0, 0, 0, 0, 0};
  if (nums.empty()) {
    return s;
  }
  s.count = static_cast<int>(nums.size());
  s.min = nums[0];
  s.max = nums[0];
  for (int v : nums) {
    s.sum += v;
    if (v < s.min) {
      s.min = v;
    }
    if (v > s.max) {
      s.max = v;
    }
    if (v % 2 == 0) {
      ++s.even_count;
    }
  }
  return s;
}
