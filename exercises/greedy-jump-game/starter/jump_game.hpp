// Exercise: greedy-jump-game
// Decide whether you can reach the last index by jumping forward.
//
// Rules:
//  - nums[i] is the maximum jump length from index i (0 <= jump <= nums[i]).
//  - Return true iff you can reach the last index starting from index 0.
//  - An empty vector and a single-element vector are trivially reachable (true).
//  - Greedy O(n): track the farthest index reachable so far.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline bool can_jump(const std::vector<int>& nums) {
  // TODO: scan left to right; if an index is beyond the farthest reach, fail.
  (void)nums;
  return false;
}
