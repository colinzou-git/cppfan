// Reference solution for tree-sum-values.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

struct TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
  explicit TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

inline int tree_sum(TreeNode* root) {
  if (root == nullptr) {
    return 0;
  }
  return root->val + tree_sum(root->left) + tree_sum(root->right);
}
