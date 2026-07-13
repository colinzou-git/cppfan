// Exercise: greedy-activity-selection
// Select the largest set of non-overlapping activities.
//
// Rules:
//  - Each activity has a start and an end. Two activities are compatible when
//    one starts at or after the other ends (an activity that ends at time t and
//    another that starts at time t do NOT overlap).
//  - Return the maximum number of mutually compatible activities.
//  - Classic greedy: sort by end time, then keep taking the earliest-finishing
//    compatible activity.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <algorithm>
#include <vector>

struct Activity {
  int start;
  int end;
};

inline int max_activities(std::vector<Activity> acts) {
  // TODO: sort by end time and greedily count compatible activities.
  (void)acts;
  return 0;
}
