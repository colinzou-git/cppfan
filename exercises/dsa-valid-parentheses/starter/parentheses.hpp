// Exercise: dsa-valid-parentheses
// Decide whether the brackets in a string are balanced and correctly nested.
//
// Rules:
//  - `is_balanced(s)` returns true if every '(', '[', '{' is closed by the
//    matching ')', ']', '}' in the correct order.
//  - Non-bracket characters are ignored (so "a(b)c" is balanced).
//  - The empty string is balanced.
//  - Use a stack; run in O(n) time.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>

inline bool is_balanced(const std::string& s) {
  // TODO: push opening brackets; on a closing bracket, check it matches the top
  // of the stack and pop. Balanced means the stack ends empty.
  (void)s;
  return false;
}
