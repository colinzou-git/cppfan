// Exercise: strings-atoi
// Convert a string to a 32-bit signed integer (like C's atoi / LeetCode myAtoi).
//
// Rules:
//  - Skip leading spaces, then read one optional '+' or '-' sign.
//  - Read consecutive digits; stop at the first non-digit character.
//  - Clamp the result to [-2147483648, 2147483647] (never wrap on overflow).
//  - If there are no digits, return 0.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>

inline int str_to_int(const std::string& s) {
  // TODO: skip spaces, read sign, accumulate digits, clamp to the int range.
  (void)s;
  return 0;
}
