// Reference solution for tree-count-leaves.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

struct TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
  explicit TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

inline int count_leaves(TreeNode* root) {
  if (root == nullptr) {
    return 0;
  }
  if (root->left == nullptr && root->right == nullptr) {
    return 1;
  }
  return count_leaves(root->left) + count_leaves(root->right);
}
