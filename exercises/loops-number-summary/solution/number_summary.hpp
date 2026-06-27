#pragma once
#include <vector>

struct NumberSummary {
  bool empty = true;
  int min = 0;
  int max = 0;
  long long sum = 0;
  int evenCount = 0;
};

inline NumberSummary summarizeNumbers(const std::vector<int>& nums) {
  NumberSummary out;
  if (nums.empty()) return out;
  out.empty = false;
  out.min = nums[0];
  out.max = nums[0];
  for (int value : nums) {
    if (value < out.min) out.min = value;
    if (value > out.max) out.max = value;
    out.sum += value;
    if (value % 2 == 0) ++out.evenCount;
  }
  return out;
}
