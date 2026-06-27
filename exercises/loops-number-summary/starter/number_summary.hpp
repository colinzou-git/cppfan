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
  (void)nums;
  return {};
}
