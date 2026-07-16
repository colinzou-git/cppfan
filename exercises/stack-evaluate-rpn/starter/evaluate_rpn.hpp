// Exercise: stack-evaluate-rpn
// Evaluate an arithmetic expression given in Reverse Polish Notation (postfix).
// Tokens are integer literals or one of the operators + - * / .
//
// Rules:
//  - `evaluate_rpn(tokens)` returns the integer result.
//  - Use a stack: push numbers; on an operator pop two, apply, push the result.
//  - The FIRST popped is the right operand; the SECOND popped is the left.
//  - Integer division truncates toward zero (C++ int division).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>
#include <vector>

inline int evaluate_rpn(const std::vector<std::string>& tokens) {
  // TODO: use a stack of ints; handle + - * / and integer literals.
  (void)tokens;
  return 0;
}
