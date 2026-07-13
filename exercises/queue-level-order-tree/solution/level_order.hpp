// Reference solution for queue-level-order-tree.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <queue>
#include <vector>

struct TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
  explicit TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

// Breadth-first level-order traversal: one inner vector per tree level.
inline std::vector<std::vector<int>> level_order(TreeNode* root) {
  std::vector<std::vector<int>> levels;
  if (root == nullptr) {
    return levels;
  }
  std::queue<TreeNode*> q;
  q.push(root);
  while (!q.empty()) {
    const std::size_t count = q.size();
    std::vector<int> level;
    level.reserve(count);
    for (std::size_t i = 0; i < count; ++i) {
      TreeNode* node = q.front();
      q.pop();
      level.push_back(node->val);
      if (node->left != nullptr) {
        q.push(node->left);
      }
      if (node->right != nullptr) {
        q.push(node->right);
      }
    }
    levels.push_back(std::move(level));
  }
  return levels;
}
