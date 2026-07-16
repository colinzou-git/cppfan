// Reference solution for backtracking-generate-parentheses.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>
#include <functional>
#include <string>
#include <vector>

inline std::vector<std::string> generate_parentheses(int n) {
  std::vector<std::string> result;
  std::string current;

  std::function<void(int, int)> go = [&](int open, int close) {
    if (static_cast<int>(current.size()) == 2 * n) {
      result.push_back(current);
      return;
    }
    if (open < n) {
      current.push_back('(');
      go(open + 1, close);
      current.pop_back();
    }
    if (close < open) {
      current.push_back(')');
      go(open, close + 1);
      current.pop_back();
    }
  };
  go(0, 0);

  std::sort(result.begin(), result.end());
  return result;
}
