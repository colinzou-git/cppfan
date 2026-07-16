// Exercise: tree-count-leaves
// Return the number of LEAF nodes in a binary tree. A leaf has no children.
//
// Rules:
//  - `count_leaves(root)` returns the count of nodes with no left and no right.
//  - Base cases: nullptr -> 0; a node whose children are both null -> 1.
//  - Otherwise: count_leaves(left) + count_leaves(right).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

struct TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
  explicit TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

inline int count_leaves(TreeNode* root) {
  // TODO: 0 for null; 1 when both children null; else sum of the two subtrees.
  (void)root;
  return 0;
}
