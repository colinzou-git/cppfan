// Reference solution for algorithm-clean-scores.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <vector>

// Drop scores outside [lo, hi], then sort ascending and remove duplicates.
inline std::vector<int> clean_scores(std::vector<int> scores, int lo, int hi) {
  scores.erase(std::remove_if(scores.begin(), scores.end(),
                              [lo, hi](int s) { return s < lo || s > hi; }),
               scores.end());
  std::sort(scores.begin(), scores.end());
  scores.erase(std::unique(scores.begin(), scores.end()), scores.end());
  return scores;
}
