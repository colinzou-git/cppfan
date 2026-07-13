// Tests for graph-dijkstra-network-delay. Build with -I _harness and impl dir.
#include <vector>

#include "check.hpp"
#include "network_delay.hpp"

static void test_reaches_all() {
  std::vector<Edge> e{{0, 1, 1}, {0, 2, 4}, {1, 2, 2}, {2, 3, 1}};
  CHECK(network_delay(4, e, 0) == 4);
}

static void test_diamond_shortest() {
  std::vector<Edge> e{{0, 1, 1}, {0, 2, 2}, {1, 3, 2}, {2, 3, 1}};
  CHECK(network_delay(4, e, 0) == 3);
}

static void test_unreachable_node() {
  std::vector<Edge> e{{0, 1, 1}};
  CHECK(network_delay(3, e, 0) == -1);
}

static void test_single_node() {
  CHECK(network_delay(1, {}, 0) == 0);
}

static void test_direct_edge() {
  std::vector<Edge> e{{0, 1, 5}};
  CHECK(network_delay(2, e, 0) == 5);
}

static void test_direction_matters() {
  std::vector<Edge> e{{1, 0, 3}};  // edge points the wrong way for source 0
  CHECK(network_delay(2, e, 0) == -1);
}

static void test_relaxation_picks_shorter() {
  // 0->1 direct 10, but 0->2->1 is 3+4=7
  std::vector<Edge> e{{0, 1, 10}, {0, 2, 3}, {2, 1, 4}};
  CHECK(network_delay(3, e, 0) == 7);
}

int main() {
  test_reaches_all();
  test_diamond_shortest();
  test_unreachable_node();
  test_single_node();
  test_direct_edge();
  test_direction_matters();
  test_relaxation_picks_shorter();
  return REPORT();
}
