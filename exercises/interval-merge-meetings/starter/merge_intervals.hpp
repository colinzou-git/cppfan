// Exercise: interval-merge-meetings
// Merge overlapping meeting intervals.
//
// Rules:
//  - Each Interval has a start and an end with start <= end.
//  - Merge intervals that overlap OR touch: [1,3] and [3,5] merge into [1,5].
//  - The result is sorted by start; input may be unsorted.
//  - An empty input returns an empty result.
//
// Hint: sort by start, then sweep, extending the current interval while the next
// one starts at or before the current end.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <algorithm>
#include <vector>

struct Interval {
  int start;
  int end;
};

inline bool operator==(const Interval& a, const Interval& b) {
  return a.start == b.start && a.end == b.end;
}

inline std::vector<Interval> merge_intervals(std::vector<Interval> intervals) {
  // TODO: sort by start, then merge intervals whose start <= the current end.
  (void)intervals;
  return {};
}
