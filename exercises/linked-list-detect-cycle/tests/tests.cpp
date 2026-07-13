// Tests for linked-list-detect-cycle. Build with -I _harness and the impl dir.
#include <cstddef>
#include <initializer_list>
#include <vector>

#include "check.hpp"
#include "detect_cycle.hpp"

// Build a chain of nodes; returns them in order so the test owns cleanup and can
// safely free even when a cycle is present (we always break it first).
static std::vector<ListNode*> make_chain(std::initializer_list<int> vals) {
  std::vector<ListNode*> nodes;
  for (int v : vals) {
    nodes.push_back(new ListNode(v));
  }
  for (std::size_t i = 0; i + 1 < nodes.size(); ++i) {
    nodes[i]->next = nodes[i + 1];
  }
  return nodes;
}

static void destroy(std::vector<ListNode*>& nodes) {
  if (!nodes.empty()) {
    nodes.back()->next = nullptr;  // break any cycle before freeing
  }
  for (ListNode* n : nodes) {
    delete n;
  }
}

static void test_no_cycle() {
  auto nodes = make_chain({1, 2, 3});
  CHECK(!has_cycle(nodes.empty() ? nullptr : nodes[0]));
  destroy(nodes);
}

static void test_empty_has_no_cycle() {
  CHECK(!has_cycle(nullptr));
}

static void test_cycle_to_middle() {
  auto nodes = make_chain({1, 2, 3, 4});
  nodes.back()->next = nodes[1];  // 4 -> 2
  CHECK(has_cycle(nodes[0]));
  destroy(nodes);
}

static void test_self_loop() {
  auto nodes = make_chain({9});
  nodes[0]->next = nodes[0];  // 9 -> 9
  CHECK(has_cycle(nodes[0]));
  destroy(nodes);
}

static void test_two_node_cycle() {
  auto nodes = make_chain({1, 2});
  nodes.back()->next = nodes[0];  // 2 -> 1
  CHECK(has_cycle(nodes[0]));
  destroy(nodes);
}

static void test_single_no_cycle() {
  auto nodes = make_chain({5});
  CHECK(!has_cycle(nodes[0]));
  destroy(nodes);
}

int main() {
  test_no_cycle();
  test_empty_has_no_cycle();
  test_cycle_to_middle();
  test_self_loop();
  test_two_node_cycle();
  test_single_no_cycle();
  return REPORT();
}
