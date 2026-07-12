// Reference solution for references-swap-clamp.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

inline void swap_ints(int& a, int& b) {
  const int tmp = a;
  a = b;
  b = tmp;
}

inline int clamp_value(int value, int lo, int hi) {
  if (value < lo) {
    return lo;
  }
  if (value > hi) {
    return hi;
  }
  return value;
}

inline void clamp_in_place(int& value, int lo, int hi) {
  value = clamp_value(value, lo, hi);
}

inline int max_of(const int& a, const int& b) {
  return a > b ? a : b;
}
