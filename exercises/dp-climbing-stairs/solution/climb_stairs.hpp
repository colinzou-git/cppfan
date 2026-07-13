// Reference solution for dp-climbing-stairs.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

// Number of distinct ways to climb n stairs taking 1 or 2 steps at a time.
inline long long climb_stairs(int n) {
  if (n <= 1) {
    return 1;
  }
  long long prev = 1;  // ways(0)
  long long cur = 1;   // ways(1)
  for (int i = 2; i <= n; ++i) {
    const long long next = prev + cur;
    prev = cur;
    cur = next;
  }
  return cur;
}
