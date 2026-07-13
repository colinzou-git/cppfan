// Tests for graph-clone-undirected. Build with -I _harness and the impl dir.
#include <algorithm>
#include <map>
#include <unordered_set>
#include <vector>

#include "check.hpp"
#include "clone_graph.hpp"

struct Built {
  GraphNode* start;
  std::vector<GraphNode*> nodes;
};

// adj[i] lists the neighbor ids of node i (undirected: list both directions).
static Built build(const std::vector<std::vector<int>>& adj) {
  Built b;
  const int n = static_cast<int>(adj.size());
  for (int i = 0; i < n; ++i) {
    b.nodes.push_back(new GraphNode(i));
  }
  for (int i = 0; i < n; ++i) {
    for (int j : adj[i]) {
      b.nodes[i]->neighbors.push_back(b.nodes[j]);
    }
  }
  b.start = (n > 0) ? b.nodes[0] : nullptr;
  return b;
}

static std::vector<GraphNode*> collect(GraphNode* start) {
  std::vector<GraphNode*> out;
  std::unordered_set<GraphNode*> seen;
  if (start == nullptr) {
    return out;
  }
  std::vector<GraphNode*> stack{start};
  seen.insert(start);
  while (!stack.empty()) {
    GraphNode* c = stack.back();
    stack.pop_back();
    out.push_back(c);
    for (GraphNode* nb : c->neighbors) {
      if (seen.insert(nb).second) {
        stack.push_back(nb);
      }
    }
  }
  return out;
}

static std::map<int, std::vector<int>> shape(const std::vector<GraphNode*>& nodes) {
  std::map<int, std::vector<int>> m;
  for (GraphNode* nd : nodes) {
    std::vector<int> nb;
    for (GraphNode* x : nd->neighbors) {
      nb.push_back(x->val);
    }
    std::sort(nb.begin(), nb.end());
    m[nd->val] = nb;
  }
  return m;
}

static void free_nodes(std::vector<GraphNode*>& nodes) {
  for (GraphNode* p : nodes) {
    delete p;
  }
  nodes.clear();
}

static void verify_clone(const std::vector<std::vector<int>>& adj) {
  Built b = build(adj);
  GraphNode* cl = clone_graph(b.start);
  CHECK(cl != nullptr);
  if (cl != nullptr) {
    std::vector<GraphNode*> clone_nodes = collect(cl);
    std::vector<GraphNode*> orig_nodes = collect(b.start);
    CHECK(clone_nodes.size() == orig_nodes.size());
    CHECK(shape(clone_nodes) == shape(orig_nodes));
    std::unordered_set<GraphNode*> os(orig_nodes.begin(), orig_nodes.end());
    bool shared = false;
    for (GraphNode* p : clone_nodes) {
      if (os.count(p) != 0) {
        shared = true;
      }
    }
    CHECK(!shared);  // a true deep copy shares no pointers
    free_nodes(clone_nodes);
  }
  free_nodes(b.nodes);
}

static void test_square() {
  verify_clone({{1, 3}, {0, 2}, {1, 3}, {0, 2}});
}

static void test_triangle() {
  verify_clone({{1, 2}, {0, 2}, {0, 1}});
}

static void test_two_nodes() {
  verify_clone({{1}, {0}});
}

static void test_single_node() {
  verify_clone({{}});
}

static void test_empty_graph() {
  CHECK(clone_graph(nullptr) == nullptr);
}

int main() {
  test_square();
  test_triangle();
  test_two_nodes();
  test_single_node();
  test_empty_graph();
  return REPORT();
}
