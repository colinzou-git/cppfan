// Exercise: strings-longest-palindrome-buildable
// Given a string, return the length of the LONGEST palindrome that can be built
// using its characters (case-sensitive). You need not use every character.
//
// Rules:
//  - `longest_palindrome(s)` returns the maximum palindrome length.
//  - Each character can contribute an even count; one odd-count character may
//    sit in the center (adds 1).
//  - Count frequencies; sum freq/2*2, then add 1 if any frequency was odd.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>

inline int longest_palindrome(const std::string& s) {
  // TODO: count character frequencies; sum the even parts and add 1 if any odd.
  (void)s;
  return 0;
}
