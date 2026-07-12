// Reference solution for set-deduplicate-preserve-count.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <set>
#include <vector>

struct DedupeResult {
  int distinct;
  int duplicates_removed;
  std::vector<int> sorted_unique;
};

inline DedupeResult dedupe(const std::vector<int>& values) {
  std::set<int> unique(values.begin(), values.end());
  DedupeResult result;
  result.distinct = static_cast<int>(unique.size());
  result.duplicates_removed = static_cast<int>(values.size()) - result.distinct;
  result.sorted_unique.assign(unique.begin(), unique.end());
  return result;
}
