// Exercise: stack-min-stack
// A LIFO stack that also reports its current minimum in O(1).
//
// Rules:
//  - push(x), pop(), top(), empty(), size() behave like a normal stack.
//  - get_min() returns the smallest value currently on the stack, in O(1).
//  - pop()/top()/get_min() are only called on a non-empty stack.
//
// Hint: alongside the values, keep a parallel stack of "minimum so far", so each
// level remembers the min of everything at or below it.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <vector>

class MinStack {
 public:
  void push(int x) {
    // TODO: store x and the running minimum.
    (void)x;
  }

  void pop() {
    // TODO: remove the top value (and its tracked minimum).
  }

  int top() const {
    // TODO: return the top value.
    return 0;
  }

  int get_min() const {
    // TODO: return the current minimum in O(1).
    return 0;
  }

  bool empty() const { return data_.empty(); }
  int size() const { return static_cast<int>(data_.size()); }

 private:
  std::vector<int> data_;
  // TODO: add whatever extra storage you need to answer get_min() in O(1).
};
