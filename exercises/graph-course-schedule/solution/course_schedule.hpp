// Reference solution for graph-course-schedule.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <queue>
#include <utility>
#include <vector>

// Can all courses be finished? Each pair {a, b} means "b must come before a".
// True iff the prerequisite digraph is acyclic (Kahn's topological sort).
inline bool can_finish(int num_courses, const std::vector<std::pair<int, int>>& prereqs) {
  std::vector<std::vector<int>> adj(num_courses);
  std::vector<int> indegree(num_courses, 0);
  for (const auto& [a, b] : prereqs) {
    adj[b].push_back(a);
    ++indegree[a];
  }

  std::queue<int> ready;
  for (int c = 0; c < num_courses; ++c) {
    if (indegree[c] == 0) {
      ready.push(c);
    }
  }

  int taken = 0;
  while (!ready.empty()) {
    const int c = ready.front();
    ready.pop();
    ++taken;
    for (int next : adj[c]) {
      if (--indegree[next] == 0) {
        ready.push(next);
      }
    }
  }
  return taken == num_courses;
}
