// Reference solution for dsa-count-set-bits.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

inline int count_set_bits(unsigned int n) {
  // Brian Kernighan's trick: n & (n - 1) clears the lowest set bit each step.
  int count = 0;
  while (n != 0) {
    n &= (n - 1);
    ++count;
  }
  return count;
}
