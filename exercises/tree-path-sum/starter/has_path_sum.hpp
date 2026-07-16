// Exercise: tree-path-sum
// Return true iff the tree has a root-to-LEAF path whose node values sum to
// exactly `target`.
//
// Rules:
//  - Only complete root-to-leaf paths count (a leaf has no children).
//  - Subtract each node's value from the target as you descend.
//  - An empty tree (nullptr) has no path, so it returns false.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

struct TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
  explicit TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

inline bool has_path_sum(TreeNode* root, int target) {
  // TODO: at a leaf, check target == val; otherwise recurse with target - val.
  (void)root;
  (void)target;
  return false;
}
