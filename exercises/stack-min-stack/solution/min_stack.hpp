// Reference solution for stack-min-stack.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <vector>

// A stack that also reports its current minimum in O(1). Each entry remembers
// the minimum of the stack at and below it.
class MinStack {
 public:
  void push(int x) {
    const int m = data_.empty() ? x : (x < mins_.back() ? x : mins_.back());
    data_.push_back(x);
    mins_.push_back(m);
  }

  void pop() {
    data_.pop_back();
    mins_.pop_back();
  }

  int top() const { return data_.back(); }
  int get_min() const { return mins_.back(); }
  bool empty() const { return data_.empty(); }
  int size() const { return static_cast<int>(data_.size()); }

 private:
  std::vector<int> data_;
  std::vector<int> mins_;
};
