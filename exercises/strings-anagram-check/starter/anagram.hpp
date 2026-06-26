// Exercise: strings-anagram-check
// Decide whether two strings are anagrams of each other, ignoring spaces and
// letter case.
//
// Rules:
//  - `are_anagrams(a, b)` returns true if, after removing spaces and lowercasing
//    letters, the two strings contain exactly the same characters with the same
//    counts.
//  - Compare by character frequency (a counting array or hash map), not by
//    sorting — aim for O(n) time.
//  - Two empty (or all-space) strings are anagrams.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>

inline bool are_anagrams(const std::string& a, const std::string& b) {
  // TODO: tally character frequencies for `a`, subtract `b`, and check every
  // count is zero (skip spaces; lowercase letters first).
  (void)a;
  (void)b;
  return false;
}
