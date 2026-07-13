// Exercise: tree-lowest-common-ancestor-bst
// Find the lowest common ancestor of two values in a binary SEARCH tree.
//
// Rules:
//  - The tree is a BST (left subtree < node < right subtree).
//  - Return the node that is the deepest ancestor of both p and q.
//  - Exploit the BST ordering: no full traversal needed. O(height).
//  - Assume both p and q exist in the tree.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

struct TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
  explicit TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

inline TreeNode* lowest_common_ancestor(TreeNode* root, int p, int q) {
  // TODO: descend from the root — go left when both values are smaller, right
  // when both are larger; otherwise the current node splits them (the LCA).
  (void)p;
  (void)q;
  return root;
}
