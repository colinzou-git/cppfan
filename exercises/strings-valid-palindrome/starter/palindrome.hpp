// Exercise: strings-valid-palindrome
// Decide whether a string is a palindrome, considering only alphanumeric
// characters and ignoring case.
//
// Rules:
//  - `is_palindrome(s)` returns true if, after dropping every non-alphanumeric
//    character and lowercasing the rest, the string reads the same forwards and
//    backwards.
//  - An empty string (or one with no alphanumerics) is a palindrome.
//  - Run in O(n) time and O(1) extra space — scan from both ends with two
//    indices; do not build a cleaned copy.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>

inline bool is_palindrome(const std::string& s) {
  // TODO: walk two indices inward, skipping non-alphanumerics, comparing the
  // lowercased characters.
  (void)s;
  return false;
}
