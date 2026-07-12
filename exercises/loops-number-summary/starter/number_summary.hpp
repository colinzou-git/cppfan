// Exercise: loops-number-summary
// Walk a vector of ints exactly once and report a small summary: how many
// values there are, their sum, the minimum, the maximum, and how many are even.
//
// Rules:
//  - Use a single loop (one pass). Do not sort or scan the data repeatedly.
//  - For an empty vector, return {0, 0, 0, 0, 0}.
//  - `sum` is a long long so many ints cannot overflow it.
//  - A value is even when v % 2 == 0 (this also holds for negatives).
//
// Only edit this file. Do not change the public interface or the tests.
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
  // TODO: seed min/max from the first element, then update all fields in one
  // pass over nums. Remember to short-circuit the empty case first.
  (void)nums;
  return NumberSummary{0, 0, 0, 0, 0};
}
