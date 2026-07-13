// Reference solution for interval-merge-meetings.
// Kept out of the learner-facing default path; do not reveal before completion.
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

// Merge overlapping or touching intervals. Result is sorted by start.
inline std::vector<Interval> merge_intervals(std::vector<Interval> intervals) {
  std::vector<Interval> merged;
  if (intervals.empty()) {
    return merged;
  }
  std::sort(intervals.begin(), intervals.end(),
            [](const Interval& a, const Interval& b) { return a.start < b.start; });
  merged.push_back(intervals.front());
  for (std::size_t i = 1; i < intervals.size(); ++i) {
    Interval& top = merged.back();
    if (intervals[i].start <= top.end) {
      top.end = std::max(top.end, intervals[i].end);
    } else {
      merged.push_back(intervals[i]);
    }
  }
  return merged;
}
