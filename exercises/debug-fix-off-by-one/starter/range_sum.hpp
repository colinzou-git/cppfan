// Exercise: debug-fix-off-by-one
// This function is SUPPOSED to sum every integer from lo to hi inclusive, but it
// has a classic off-by-one bug: it stops one short and never adds hi.
//
// Your job: find and fix the boundary so the loop includes hi. Do not rewrite
// the function with a closed-form formula — fix the loop bound.
//
// Precondition: lo <= hi.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

inline long long range_sum(int lo, int hi) {
  long long total = 0;
  for (int i = lo; i < hi; ++i) {  // BUG: excludes hi
    total += i;
  }
  return total;
}
