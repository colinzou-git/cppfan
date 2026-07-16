// Reference solution for tree-max-depth.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>

struct TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
  explicit TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

inline int max_depth(TreeNode* root) {
  if (root == nullptr) {
    return 0;
  }
  return 1 + std::max(max_depth(root->left), max_depth(root->right));
}
