// Exercise: deque-browser-history
// Model browser history with a back/forward cursor.
//
// Rules:
//  - Construct with a homepage; current() is that page.
//  - visit(url): drop any forward history, append url, and land on it.
//  - back(steps): move back up to `steps` pages, clamping at the first page;
//    return the new current page.
//  - forward(steps): move forward up to `steps` pages, clamping at the last
//    page; return the new current page.
//  - Negative steps count as 0.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>
#include <vector>

class BrowserHistory {
 public:
  explicit BrowserHistory(const std::string& homepage) {
    // TODO: start history at the homepage with the cursor on it.
    (void)homepage;
  }

  void visit(const std::string& url) {
    // TODO: drop forward history, append url, move cursor to it.
    (void)url;
  }

  std::string current() const {
    // TODO: return the page under the cursor.
    return "";
  }

  std::string back(int steps) {
    // TODO: move back up to `steps`, clamping at the first page.
    (void)steps;
    return current();
  }

  std::string forward(int steps) {
    // TODO: move forward up to `steps`, clamping at the last page.
    (void)steps;
    return current();
  }

 private:
  std::vector<std::string> history_;
  std::size_t cursor_ = 0;
};
