// Exercise: strings-roman-to-integer
// Convert a valid Roman numeral string (uppercase) to its integer value.
//
// Rules:
//  - `roman_to_integer(s)` returns the integer the numeral represents.
//  - Symbols: I=1, V=5, X=10, L=50, C=100, D=500, M=1000.
//  - Add each value, EXCEPT when a smaller value precedes a larger one, in which
//    case it is subtracted (IV = 4, IX = 9, XL = 40, ...).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>

inline int roman_to_integer(const std::string& s) {
  // TODO: map each symbol to its value; add, but subtract when the next symbol
  // is larger than the current one.
  (void)s;
  return 0;
}
