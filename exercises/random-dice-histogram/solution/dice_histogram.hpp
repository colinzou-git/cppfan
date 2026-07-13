// Reference solution for random-dice-histogram.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <array>
#include <random>

// Roll a 6-sided die `rolls` times with a std::mt19937 seeded by `seed`, mapping
// each engine output to a face as (rng() % 6) + 1. Return the tally of faces
// 1..6 (index 0 == face 1). The mt19937 sequence is standardized, so the result
// is fully reproducible for a given seed.
inline std::array<int, 6> roll_histogram(unsigned seed, int rolls) {
  std::array<int, 6> counts{};
  std::mt19937 rng(seed);
  for (int i = 0; i < rolls; ++i) {
    const int face = static_cast<int>(rng() % 6);  // 0..5
    ++counts[static_cast<std::size_t>(face)];
  }
  return counts;
}
