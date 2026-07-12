// Exercise: algorithm-clean-scores
// Clean a list of scores using STL algorithms.
//
// Rules:
//  - Drop every score outside the inclusive range [lo, hi].
//  - Sort the survivors in ascending order.
//  - Remove duplicates so each value appears once.
//  - Return the cleaned vector.
//
// Idiomatic tools: std::remove_if + erase, std::sort, std::unique + erase.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <algorithm>
#include <vector>

inline std::vector<int> clean_scores(std::vector<int> scores, int lo, int hi) {
  // TODO: erase-remove out-of-range values, sort, then unique-erase duplicates.
  (void)lo;
  (void)hi;
  return scores;
}
