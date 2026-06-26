// Reference solution for dsa-sort-by-frequency.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <map>
#include <vector>

inline std::vector<int> sort_by_frequency(std::vector<int> nums) {
  std::map<int, int> freq;
  for (int x : nums) {
    ++freq[x];
  }
  std::sort(nums.begin(), nums.end(), [&freq](int a, int b) {
    if (freq[a] != freq[b]) return freq[a] < freq[b];  // fewer occurrences first
    return a < b;                                       // ties: smaller value first
  });
  return nums;
}
