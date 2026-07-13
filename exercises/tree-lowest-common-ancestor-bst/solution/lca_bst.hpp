// Reference solution for tree-lowest-common-ancestor-bst.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

struct TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
  explicit TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

// Lowest common ancestor of values p and q in a BST. Walk down: when both are
// smaller go left, both larger go right, otherwise this node is the split point.
inline TreeNode* lowest_common_ancestor(TreeNode* root, int p, int q) {
  TreeNode* node = root;
  while (node != nullptr) {
    if (p < node->val && q < node->val) {
      node = node->left;
    } else if (p > node->val && q > node->val) {
      node = node->right;
    } else {
      return node;
    }
  }
  return nullptr;
}
