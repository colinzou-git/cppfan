// Exercise: stack-daily-temperatures
// Given daily temperatures, return an array where answer[i] is the number of days
// you must wait after day i for a strictly WARMER day. If none exists, answer[i]
// is 0.
//
// Rules:
//  - `daily_temperatures(temps)` returns the wait-days array.
//  - Use a monotonic stack of indices (O(n) total).
//  - When temps[i] is warmer than temps[stack top], resolve that index.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline std::vector<int> daily_temperatures(const std::vector<int>& temps) {
  // TODO: monotonic stack of indices; answer[popped] = i - popped.
  (void)temps;
  return {};
}
