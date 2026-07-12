// Tests for deque-browser-history. Build with -I _harness and the impl dir.
#include <string>

#include "check.hpp"
#include "browser_history.hpp"

static void test_starts_on_homepage() {
  BrowserHistory h("home");
  CHECK(h.current() == "home");
}

static void test_visit_updates_current() {
  BrowserHistory h("home");
  h.visit("a");
  h.visit("b");
  CHECK(h.current() == "b");
}

static void test_back_and_forward() {
  BrowserHistory h("home");
  h.visit("a");
  h.visit("b");
  CHECK(h.back(1) == "a");
  CHECK(h.forward(1) == "b");
}

static void test_back_clamps_at_start() {
  BrowserHistory h("home");
  h.visit("a");
  CHECK(h.back(5) == "home");
}

static void test_forward_clamps_at_end() {
  BrowserHistory h("home");
  h.visit("a");
  h.back(1);
  CHECK(h.forward(5) == "a");
}

static void test_visit_clears_forward() {
  BrowserHistory h("home");
  h.visit("a");
  h.visit("b");
  h.back(2);          // back to home
  h.visit("c");       // clears a and b
  CHECK(h.current() == "c");
  CHECK(h.forward(1) == "c");  // nothing ahead of c
  CHECK(h.back(1) == "home");
}

int main() {
  test_starts_on_homepage();
  test_visit_updates_current();
  test_back_and_forward();
  test_back_clamps_at_start();
  test_forward_clamps_at_end();
  test_visit_clears_forward();
  return REPORT();
}
