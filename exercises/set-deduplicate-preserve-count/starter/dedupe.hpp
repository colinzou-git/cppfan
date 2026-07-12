// Exercise: set-deduplicate-preserve-count
// Deduplicate a list of ints while reporting how many duplicates were removed.
//
// Rules:
//  - sorted_unique holds each distinct value once, in ascending order.
//  - distinct is the number of distinct values.
//  - duplicates_removed is values.size() - distinct.
//  - An empty input yields {0, 0, {}}.
//
// A std::set gives you sorted, de-duplicated keys for free.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <set>
#include <vector>

struct DedupeResult {
  int distinct;
  int duplicates_removed;
  std::vector<int> sorted_unique;
};

inline DedupeResult dedupe(const std::vector<int>& values) {
  // TODO: insert into a std::set, then fill the result fields.
  (void)values;
  return DedupeResult{0, 0, {}};
}
