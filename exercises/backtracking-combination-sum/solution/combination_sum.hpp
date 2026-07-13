// Reference solution for backtracking-combination-sum.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <cstddef>
#include <functional>
#include <vector>

// All combinations of distinct candidates (each usable unlimited times) that sum
// to target. Each combination is ascending; the result is sorted for stability.
inline std::vector<std::vector<int>> combination_sum(std::vector<int> candidates, int target) {
  std::sort(candidates.begin(), candidates.end());
  std::vector<std::vector<int>> result;
  std::vector<int> current;

  std::function<void(std::size_t, int)> go = [&](std::size_t start, int remaining) {
    if (remaining == 0) {
      result.push_back(current);
      return;
    }
    for (std::size_t i = start; i < candidates.size(); ++i) {
      if (candidates[i] > remaining) {
        break;  // sorted: no larger candidate can fit either
      }
      current.push_back(candidates[i]);
      go(i, remaining - candidates[i]);  // i (not i+1): reuse allowed
      current.pop_back();
    }
  };
  go(0, target);

  std::sort(result.begin(), result.end());
  return result;
}
