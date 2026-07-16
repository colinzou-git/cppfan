// Reference solution for bit-hamming-distance.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

inline int hamming_distance(int a, int b) {
  unsigned int diff = static_cast<unsigned int>(a) ^ static_cast<unsigned int>(b);
  int count = 0;
  while (diff != 0) {
    diff &= diff - 1;  // clear the lowest set bit
    ++count;
  }
  return count;
}
