// Exercise: dp-climbing-stairs
// Count the distinct ways to climb n stairs, taking 1 or 2 steps at a time.
//
// Rules:
//  - ways(0) = 1 and ways(1) = 1; otherwise ways(n) = ways(n-1) + ways(n-2).
//  - Return the count as a long long (it grows like Fibonacci).
//  - Use O(n) time and O(1) space (iterate; do not use naive recursion).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

inline long long climb_stairs(int n) {
  // TODO: iterate, keeping the previous two counts.
  (void)n;
  return 0;
}
