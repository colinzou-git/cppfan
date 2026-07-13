// Reference solution for greedy-activity-selection.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <vector>

struct Activity {
  int start;
  int end;
};

// Maximum number of mutually non-overlapping activities. Greedy: always take the
// next activity that finishes earliest and starts at/after the last finish.
inline int max_activities(std::vector<Activity> acts) {
  std::sort(acts.begin(), acts.end(),
            [](const Activity& a, const Activity& b) { return a.end < b.end; });
  int count = 0;
  int last_end = -1;
  bool first = true;
  for (const Activity& a : acts) {
    if (first || a.start >= last_end) {
      ++count;
      last_end = a.end;
      first = false;
    }
  }
  return count;
}
