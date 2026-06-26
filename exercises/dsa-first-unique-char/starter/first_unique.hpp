// Exercise: dsa-first-unique-char
// Find the index of the first non-repeating character in a string.
//
// Rules:
//  - `first_unique_index(s)` returns the index of the first character that
//    appears exactly once in `s`.
//  - If every character repeats (or the string is empty), return -1.
//  - Two passes: count character frequencies, then scan for the first count of 1.
//    Run in O(n) time.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>

inline int first_unique_index(const std::string& s) {
  // TODO: tally each character's frequency, then return the index of the first
  // character whose count is 1.
  (void)s;
  return -1;
}
