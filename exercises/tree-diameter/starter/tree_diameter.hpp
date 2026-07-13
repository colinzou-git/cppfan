// Exercise: tree-diameter
// Compute the diameter of a binary tree.
//
// Rules:
//  - The diameter is the number of EDGES on the longest path between any two
//    nodes (the path need not pass through the root).
//  - An empty tree and a single node both have diameter 0.
//  - Do it in one DFS: return each subtree's height while tracking the best
//    left-height + right-height seen at any node.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <algorithm>

struct TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
  explicit TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

inline int tree_diameter(TreeNode* root) {
  // TODO: DFS returning subtree height; update the best diameter at each node.
  (void)root;
  return 0;
}
