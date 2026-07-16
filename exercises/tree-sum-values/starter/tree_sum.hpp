// Exercise: tree-sum-values
// Return the sum of all node values in a binary tree. An empty tree sums to 0.
//
// Rules:
//  - `tree_sum(root)` returns the total of every node's value.
//  - Base case: a null node contributes 0.
//  - Recursive case: root->val + tree_sum(left) + tree_sum(right).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

struct TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
  explicit TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

inline int tree_sum(TreeNode* root) {
  // TODO: return 0 for nullptr, else root->val plus both subtree sums.
  (void)root;
  return 0;
}
