// Reference solution for debug-fix-off-by-one.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

// Sum of the integers lo, lo+1, ..., hi (inclusive). Precondition: lo <= hi.
inline long long range_sum(int lo, int hi) {
  long long total = 0;
  for (int i = lo; i <= hi; ++i) {  // inclusive of hi
    total += i;
  }
  return total;
}
