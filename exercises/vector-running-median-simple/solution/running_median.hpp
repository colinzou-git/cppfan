// Reference solution for vector-running-median-simple.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <functional>
#include <queue>
#include <vector>

// Median after each insertion, using a max-heap for the lower half and a
// min-heap for the upper half. Even count -> average of the two middle values.
inline std::vector<double> running_medians(const std::vector<int>& stream) {
  std::priority_queue<int> lower;  // max-heap of the smaller half
  std::priority_queue<int, std::vector<int>, std::greater<>> upper;  // min-heap of the larger half
  std::vector<double> medians;
  medians.reserve(stream.size());

  for (int value : stream) {
    if (lower.empty() || value <= lower.top()) {
      lower.push(value);
    } else {
      upper.push(value);
    }
    // Rebalance so |lower| == |upper| or |lower| == |upper| + 1.
    if (lower.size() > upper.size() + 1) {
      upper.push(lower.top());
      lower.pop();
    } else if (upper.size() > lower.size()) {
      lower.push(upper.top());
      upper.pop();
    }

    if (lower.size() == upper.size()) {
      medians.push_back((static_cast<double>(lower.top()) + upper.top()) / 2.0);
    } else {
      medians.push_back(static_cast<double>(lower.top()));
    }
  }
  return medians;
}
