// Exercise: strings-longest-unique-substring
// Find the length of the longest substring with no repeated characters.
//
// Rules:
//  - `longest_unique_substring(s)` returns the length of the longest contiguous
//    substring of `s` in which every character is distinct.
//  - The empty string has length 0.
//  - Use a sliding window: remember each character's last position and move the
//    window's left edge past a repeat. Run in O(n) time.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>

inline int longest_unique_substring(const std::string& s) {
  // TODO: slide a window [start, i]; when s[i] was last seen at or after start,
  // move start just past that position. Track the largest window width.
  (void)s;
  return 0;
}
