// Exercise: random-dice-histogram
// Roll a die deterministically and tally the faces.
//
// Rules:
//  - Seed a std::mt19937 with `seed` and roll `rolls` times.
//  - Map each engine output to a face with (rng() % 6) + 1 (faces 1..6).
//  - Return the counts of faces 1..6 in a std::array<int, 6>, where index 0 is
//    face 1 and index 5 is face 6.
//  - Because mt19937 is standardized, the same seed always gives the same tally.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <array>
#include <random>

inline std::array<int, 6> roll_histogram(unsigned seed, int rolls) {
  // TODO: seed an mt19937, roll `rolls` times, and tally (rng() % 6) into counts.
  (void)seed;
  (void)rolls;
  return std::array<int, 6>{};
}
