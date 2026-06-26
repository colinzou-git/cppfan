// Reference solution for stl-vector-stats.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <numeric>
#include <vector>

struct VectorStats {
  int min;
  int max;
  long long sum;
  double mean;
};

inline VectorStats summarize(const std::vector<int>& nums) {
  const int min = *std::min_element(nums.begin(), nums.end());
  const int max = *std::max_element(nums.begin(), nums.end());
  const long long sum = std::accumulate(nums.begin(), nums.end(), 0LL);
  const double mean = static_cast<double>(sum) / static_cast<double>(nums.size());
  return {min, max, sum, mean};
}
