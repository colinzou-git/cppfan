// Exercise: queue-level-order-tree
// Return the level-order (breadth-first) traversal of a binary tree.
//
// Rules:
//  - Produce one inner vector per level, top to bottom, left to right.
//  - An empty tree (nullptr) yields an empty result.
//  - Use a queue to visit nodes breadth-first; process one full level at a time
//    by capturing the queue size before the level loop.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <queue>
#include <vector>

struct TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
  explicit TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

inline std::vector<std::vector<int>> level_order(TreeNode* root) {
  // TODO: BFS with a queue; group each level's values into its own vector.
  (void)root;
  return {};
}
