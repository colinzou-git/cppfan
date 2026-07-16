// Reference solution for stack-evaluate-rpn.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <string>
#include <vector>

inline int evaluate_rpn(const std::vector<std::string>& tokens) {
  std::vector<int> stack;
  for (const std::string& tok : tokens) {
    if (tok == "+" || tok == "-" || tok == "*" || tok == "/") {
      int right = stack.back();
      stack.pop_back();
      int left = stack.back();
      stack.pop_back();
      int result = 0;
      if (tok == "+") result = left + right;
      else if (tok == "-") result = left - right;
      else if (tok == "*") result = left * right;
      else result = left / right;  // truncates toward zero
      stack.push_back(result);
    } else {
      stack.push_back(std::stoi(tok));
    }
  }
  return stack.back();
}
