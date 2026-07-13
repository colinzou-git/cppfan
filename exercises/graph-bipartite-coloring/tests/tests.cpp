// Tests for graph-bipartite-coloring. Build with -I _harness and the impl dir.
#include <utility>
#include <vector>

#include "check.hpp"
#include "bipartite.hpp"

using Edges = std::vector<std::pair<int, int>>;

static void test_even_cycle_is_bipartite() {
  // 0-1-2-3-0 (length 4)
  CHECK(is_bipartite(4, Edges{{0, 1}, {1, 2}, {2, 3}, {3, 0}}));
}

static void test_odd_cycle_not_bipartite() {
  // triangle 0-1-2-0
  CHECK(!is_bipartite(3, Edges{{0, 1}, {1, 2}, {2, 0}}));
}

static void test_tree_is_bipartite() {
  CHECK(is_bipartite(5, Edges{{0, 1}, {0, 2}, {1, 3}, {1, 4}}));
}

static void test_disconnected_mixed() {
  // component {0,1,2} triangle (odd) + component {3,4} edge
  CHECK(!is_bipartite(5, Edges{{0, 1}, {1, 2}, {2, 0}, {3, 4}}));
}

static void test_no_edges() {
  CHECK(is_bipartite(3, Edges{}));
}

static void test_single_edge() {
  CHECK(is_bipartite(2, Edges{{0, 1}}));
}

int main() {
  test_even_cycle_is_bipartite();
  test_odd_cycle_not_bipartite();
  test_tree_is_bipartite();
  test_disconnected_mixed();
  test_no_edges();
  test_single_edge();
  return REPORT();
}
