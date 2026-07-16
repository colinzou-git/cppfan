// Exercise: dp-coin-change-ways
// Count the number of distinct combinations of coins (unlimited supply of each)
// that sum exactly to `amount`. Combinations that differ only in order count once.
//
// Rules:
//  - `count_ways(coins, amount)` returns the number of combinations.
//  - There is exactly one way to make amount 0: choose no coins.
//  - Iterate coins on the OUTER loop so order does not create duplicates.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline long long count_ways(const std::vector<int>& coins, int amount) {
  // TODO: ways[0] = 1; for each coin, add ways[t - coin] to ways[t].
  (void)coins;
  (void)amount;
  return 0;
}
