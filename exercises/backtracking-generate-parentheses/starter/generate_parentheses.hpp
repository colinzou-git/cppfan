// Exercise: backtracking-generate-parentheses
// Return every combination of `n` pairs of well-formed parentheses, sorted.
//
// Rules:
//  - `generate_parentheses(n)` returns all valid strings of n '(' and n ')'.
//  - Add '(' while the open count is below n; add ')' only while close < open.
//  - Record a copy when the string reaches length 2*n; sort the result.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>
#include <vector>

inline std::vector<std::string> generate_parentheses(int n) {
  // TODO: backtrack over open/close counts and sort the result.
  (void)n;
  return {};
}
