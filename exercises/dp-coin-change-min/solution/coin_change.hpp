// Reference solution for dp-coin-change-min.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

// Fewest coins summing to amount using unlimited copies of each coin, or -1 when
// it cannot be made. Bottom-up DP over amounts.
inline int coin_change(const std::vector<int>& coins, int amount) {
  if (amount < 0) {
    return -1;
  }
  const int kInf = amount + 1;
  std::vector<int> best(amount + 1, kInf);
  best[0] = 0;
  for (int a = 1; a <= amount; ++a) {
    for (int coin : coins) {
      if (coin > 0 && coin <= a && best[a - coin] + 1 < best[a]) {
        best[a] = best[a - coin] + 1;
      }
    }
  }
  return best[amount] == kInf ? -1 : best[amount];
}
