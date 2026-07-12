// Reference solution for deque-browser-history.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <string>
#include <vector>

class BrowserHistory {
 public:
  explicit BrowserHistory(const std::string& homepage) : history_{homepage}, cursor_(0) {}

  // Visiting a page drops any forward history and lands on the new page.
  void visit(const std::string& url) {
    history_.resize(cursor_ + 1);
    history_.push_back(url);
    cursor_ = history_.size() - 1;
  }

  std::string current() const { return history_[cursor_]; }

  // Move back up to `steps` pages, clamping at the first page.
  std::string back(int steps) {
    if (steps < 0) {
      steps = 0;
    }
    cursor_ = (static_cast<std::size_t>(steps) > cursor_) ? 0 : cursor_ - steps;
    return current();
  }

  // Move forward up to `steps` pages, clamping at the last page.
  std::string forward(int steps) {
    if (steps < 0) {
      steps = 0;
    }
    const std::size_t last = history_.size() - 1;
    cursor_ = (cursor_ + steps > last) ? last : cursor_ + steps;
    return current();
  }

 private:
  std::vector<std::string> history_;
  std::size_t cursor_;
};
