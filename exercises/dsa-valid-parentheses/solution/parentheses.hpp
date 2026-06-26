// Reference solution for dsa-valid-parentheses.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <string>
#include <vector>

inline bool is_balanced(const std::string& s) {
  std::vector<char> stack;
  for (char c : s) {
    if (c == '(' || c == '[' || c == '{') {
      stack.push_back(c);
    } else if (c == ')' || c == ']' || c == '}') {
      if (stack.empty()) return false;
      const char top = stack.back();
      if ((c == ')' && top != '(') || (c == ']' && top != '[') || (c == '}' && top != '{')) {
        return false;
      }
      stack.pop_back();
    }
    // Any other character is ignored.
  }
  return stack.empty();
}
