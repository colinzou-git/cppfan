// Exercise: graph-course-schedule
// Decide whether every course can be finished given prerequisite constraints.
//
// Rules:
//  - Courses are 0..num_courses-1.
//  - Each pair {a, b} means course b must be taken before course a.
//  - Return true iff there is NO cyclic dependency (all courses are finishable).
//  - Kahn's algorithm (BFS topological sort) or DFS cycle detection both work.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <utility>
#include <vector>

inline bool can_finish(int num_courses, const std::vector<std::pair<int, int>>& prereqs) {
  // TODO: build the dependency graph and detect whether it is acyclic.
  (void)num_courses;
  (void)prereqs;
  return true;
}
