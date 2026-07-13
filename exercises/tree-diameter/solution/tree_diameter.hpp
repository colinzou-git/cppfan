// Reference solution for tree-diameter.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <algorithm>

struct TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
  explicit TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

// Diameter = the number of edges on the longest path between any two nodes.
// One DFS returns each subtree's height while updating the best diameter.
inline int tree_diameter(TreeNode* root) {
  int best = 0;
  // Returns the height (in edges) of the subtree rooted at node.
  auto dfs = [&best](auto&& self, TreeNode* node) -> int {
    if (node == nullptr) {
      return -1;  // height of an empty subtree, so a leaf has height 0
    }
    const int left = self(self, node->left) + 1;
    const int right = self(self, node->right) + 1;
    best = std::max(best, left + right);  // path through this node
    return std::max(left, right);
  };
  dfs(dfs, root);
  return best;
}
