// Exercise: dp-coin-change-min
// Make an amount with the fewest coins (unlimited coins of each denomination).
//
// Rules:
//  - Return the minimum number of coins that sum to amount, or -1 if impossible.
//  - amount == 0 needs 0 coins.
//  - Each coin denomination may be used any number of times.
//  - Bottom-up DP: best[a] = 1 + min over coins of best[a - coin].
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

inline int coin_change(const std::vector<int>& coins, int amount) {
  // TODO: fill a best[] table from 0..amount; return best[amount] or -1.
  (void)coins;
  (void)amount;
  return -1;
}
