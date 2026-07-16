// Exercise: tree-max-depth
// Return the maximum depth of a binary tree, measured in NODES along the longest
// root-to-leaf path. An empty tree has depth 0; a single node has depth 1.
//
// Rules:
//  - `max_depth(root)` returns the number of nodes on the longest root-to-leaf
//    path.
//  - Base case: a null node contributes 0.
//  - Recursive case: 1 + max(depth(left), depth(right)).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

struct TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
  explicit TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

inline int max_depth(TreeNode* root) {
  // TODO: return 0 for nullptr, else 1 + max of the two subtree depths.
  (void)root;
  return 0;
}
