// Reference solution for tree-validate-bst.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

struct TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
  explicit TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

inline bool bst_within(TreeNode* node, long long low, long long high) {
  if (node == nullptr) {
    return true;
  }
  if (node->val <= low || node->val >= high) {
    return false;
  }
  return bst_within(node->left, low, node->val) &&
         bst_within(node->right, node->val, high);
}

inline bool is_valid_bst(TreeNode* root) {
  return bst_within(root, -4000000000LL, 4000000000LL);
}
