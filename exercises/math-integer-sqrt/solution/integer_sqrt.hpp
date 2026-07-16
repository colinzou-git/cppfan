// Reference solution for math-integer-sqrt.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

inline int integer_sqrt(int x) {
  long long lo = 0;
  long long hi = x;
  long long best = 0;
  while (lo <= hi) {
    long long mid = lo + (hi - lo) / 2;
    if (mid * mid <= static_cast<long long>(x)) {
      best = mid;      // mid is a valid candidate; try larger
      lo = mid + 1;
    } else {
      hi = mid - 1;    // too big; shrink
    }
  }
  return static_cast<int>(best);
}
