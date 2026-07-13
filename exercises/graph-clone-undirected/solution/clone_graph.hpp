// Reference solution for graph-clone-undirected.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <unordered_map>
#include <vector>

struct GraphNode {
  int val;
  std::vector<GraphNode*> neighbors;
  explicit GraphNode(int v) : val(v) {}
};

// Deep-copy a connected undirected graph reachable from `node`. Every node and
// edge is duplicated; the returned graph shares no pointers with the original.
inline GraphNode* clone_graph(GraphNode* node) {
  if (node == nullptr) {
    return nullptr;
  }
  std::unordered_map<GraphNode*, GraphNode*> made;

  // Iterative DFS so deep graphs don't overflow the stack.
  std::vector<GraphNode*> stack{node};
  made[node] = new GraphNode(node->val);
  while (!stack.empty()) {
    GraphNode* cur = stack.back();
    stack.pop_back();
    for (GraphNode* nb : cur->neighbors) {
      if (made.find(nb) == made.end()) {
        made[nb] = new GraphNode(nb->val);
        stack.push_back(nb);
      }
      made[cur]->neighbors.push_back(made[nb]);
    }
  }
  return made[node];
}
