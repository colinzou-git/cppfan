// Tests for graph-kruskal-mst. Build with -I _harness and the impl dir.
#include <vector>

#include "check.hpp"
#include "kruskal.hpp"

using E = std::vector<WeightedEdge>;

static void test_square_with_diagonals() {
  E e{{0, 1, 1}, {1, 2, 2}, {2, 3, 3}, {0, 3, 4}, {0, 2, 5}};
  CHECK(mst_weight(4, e) == 6);
}

static void test_triangle_picks_two_smallest() {
  E e{{0, 1, 1}, {1, 2, 2}, {0, 2, 3}};
  CHECK(mst_weight(3, e) == 3);
}

static void test_disconnected() {
  E e{{0, 1, 1}};
  CHECK(mst_weight(3, e) == -1);
}

static void test_single_vertex() {
  CHECK(mst_weight(1, {}) == 0);
}

static void test_two_vertices() {
  E e{{0, 1, 5}};
  CHECK(mst_weight(2, e) == 5);
}

static void test_parallel_edges() {
  E e{{0, 1, 5}, {0, 1, 2}};
  CHECK(mst_weight(2, e) == 2);
}

static void test_avoids_cycle_edge() {
  // A cheap edge that would form a cycle must be skipped.
  E e{{0, 1, 1}, {1, 2, 1}, {0, 2, 1}, {2, 3, 4}};
  CHECK(mst_weight(4, e) == 6);  // 1 + 1 + 4
}

int main() {
  test_square_with_diagonals();
  test_triangle_picks_two_smallest();
  test_disconnected();
  test_single_vertex();
  test_two_vertices();
  test_parallel_edges();
  test_avoids_cycle_edge();
  return REPORT();
}
