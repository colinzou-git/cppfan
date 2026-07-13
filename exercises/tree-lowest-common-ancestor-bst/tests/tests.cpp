// Tests for tree-lowest-common-ancestor-bst. Build with -I _harness and impl dir.
#include <initializer_list>

#include "check.hpp"
#include "lca_bst.hpp"

static TreeNode* insert(TreeNode* root, int v) {
  if (root == nullptr) {
    return new TreeNode(v);
  }
  if (v < root->val) {
    root->left = insert(root->left, v);
  } else {
    root->right = insert(root->right, v);
  }
  return root;
}

static TreeNode* build(std::initializer_list<int> vals) {
  TreeNode* root = nullptr;
  for (int v : vals) {
    root = insert(root, v);
  }
  return root;
}

static void destroy(TreeNode* root) {
  if (root == nullptr) {
    return;
  }
  destroy(root->left);
  destroy(root->right);
  delete root;
}

// Shared shape:            6
//                        /   \
//                       2     8
//                      / \   / \
//                     0   4 7   9
//                        / \
//                       3   5
static TreeNode* sample() { return build({6, 2, 8, 0, 4, 7, 9, 3, 5}); }

static void test_split_at_root() {
  TreeNode* t = sample();
  CHECK(lowest_common_ancestor(t, 2, 8)->val == 6);
  destroy(t);
}

static void test_split_in_left_subtree() {
  TreeNode* t = sample();
  CHECK(lowest_common_ancestor(t, 0, 4)->val == 2);
  CHECK(lowest_common_ancestor(t, 3, 5)->val == 4);
  destroy(t);
}

static void test_ancestor_is_one_of_them() {
  TreeNode* t = sample();
  CHECK(lowest_common_ancestor(t, 2, 4)->val == 2);
  CHECK(lowest_common_ancestor(t, 8, 9)->val == 8);
  destroy(t);
}

static void test_deep_pair() {
  TreeNode* t = sample();
  CHECK(lowest_common_ancestor(t, 0, 5)->val == 2);
  CHECK(lowest_common_ancestor(t, 7, 9)->val == 8);
  destroy(t);
}

static void test_single_node() {
  TreeNode* t = build({42});
  CHECK(lowest_common_ancestor(t, 42, 42)->val == 42);
  destroy(t);
}

int main() {
  test_split_at_root();
  test_split_in_left_subtree();
  test_ancestor_is_one_of_them();
  test_deep_pair();
  test_single_node();
  return REPORT();
}
