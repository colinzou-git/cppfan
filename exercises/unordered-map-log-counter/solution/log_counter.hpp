// Reference solution for unordered-map-log-counter.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <string>
#include <unordered_map>

class LogCounter {
 public:
  void record(const std::string& event) { ++counts_[event]; }

  int count(const std::string& event) const {
    auto it = counts_.find(event);
    return it == counts_.end() ? 0 : it->second;
  }

  int distinct() const { return static_cast<int>(counts_.size()); }

  // Most frequent event; ties broken by the lexicographically smallest name.
  // Returns "" when nothing has been recorded.
  std::string most_frequent() const {
    bool found = false;
    std::string best;
    int best_count = 0;
    for (const auto& [event, n] : counts_) {
      if (!found || n > best_count || (n == best_count && event < best)) {
        best = event;
        best_count = n;
        found = true;
      }
    }
    return best;
  }

 private:
  std::unordered_map<std::string, int> counts_;
};
