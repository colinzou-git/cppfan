// Reference solution for tree-path-sum.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

struct TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
  explicit TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

inline bool has_path_sum(TreeNode* root, int target) {
  if (root == nullptr) {
    return false;
  }
  if (root->left == nullptr && root->right == nullptr) {
    return target == root->val;
  }
  int remaining = target - root->val;
  return has_path_sum(root->left, remaining) ||
         has_path_sum(root->right, remaining);
}
