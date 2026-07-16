// Reference solution for dp-coin-change-ways.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <cstdint>
#include <vector>

inline long long count_ways(const std::vector<int>& coins, int amount) {
  std::vector<long long> ways(amount + 1, 0);
  ways[0] = 1;
  for (int coin : coins) {
    for (int t = coin; t <= amount; ++t) {
      ways[t] += ways[t - coin];
    }
  }
  return ways[amount];
}
