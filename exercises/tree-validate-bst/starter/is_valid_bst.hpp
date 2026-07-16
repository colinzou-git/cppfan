// Exercise: tree-validate-bst
// Return true iff the binary tree is a valid binary search tree: for every node,
// all values in its left subtree are strictly smaller and all values in its
// right subtree are strictly larger.
//
// Rules:
//  - A local parent/child comparison is not enough; carry a (low, high) range.
//  - Left child tightens the upper bound; right child tightens the lower bound.
//  - Equal values are NOT allowed (strict BST). An empty tree is valid.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

struct TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
  explicit TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

inline bool is_valid_bst(TreeNode* root) {
  // TODO: recurse with an open (low, high) interval and check each node.
  (void)root;
  return false;
}
