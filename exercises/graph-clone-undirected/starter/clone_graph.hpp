// Exercise: graph-clone-undirected
// Deep-copy a connected undirected graph.
//
// Rules:
//  - Given a reference to any node, return an independent copy of the whole
//    reachable graph: every node and edge duplicated.
//  - The clone must share NO pointers with the original (a true deep copy).
//  - Preserve each node's val and its full neighbor set.
//  - clone_graph(nullptr) returns nullptr.
//
// Hint: map each original node to its copy while you traverse (BFS or DFS), so
// shared neighbors and cycles are copied exactly once.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <unordered_map>
#include <vector>

struct GraphNode {
  int val;
  std::vector<GraphNode*> neighbors;
  explicit GraphNode(int v) : val(v) {}
};

inline GraphNode* clone_graph(GraphNode* node) {
  // TODO: traverse from node, creating one copy per original and wiring the
  // copied neighbor pointers using an original->copy map.
  (void)node;
  return nullptr;
}
