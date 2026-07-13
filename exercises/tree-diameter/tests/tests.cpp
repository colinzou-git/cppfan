// Tests for tree-diameter. Build with -I _harness and the impl dir.
#include <climits>
#include <queue>
#include <vector>

#include "check.hpp"
#include "tree_diameter.hpp"

static const int NUL = INT_MIN;

static TreeNode* build(const std::vector<int>& vals) {
  if (vals.empty() || vals[0] == NUL) {
    return nullptr;
  }
  TreeNode* root = new TreeNode(vals[0]);
  std::queue<TreeNode*> q;
  q.push(root);
  std::size_t i = 1;
  while (!q.empty() && i < vals.size()) {
    TreeNode* n = q.front();
    q.pop();
    if (i < vals.size()) {
      if (vals[i] != NUL) {
        n->left = new TreeNode(vals[i]);
        q.push(n->left);
      }
      ++i;
    }
    if (i < vals.size()) {
      if (vals[i] != NUL) {
        n->right = new TreeNode(vals[i]);
        q.push(n->right);
      }
      ++i;
    }
  }
  return root;
}

static void destroy(TreeNode* r) {
  if (r == nullptr) {
    return;
  }
  destroy(r->left);
  destroy(r->right);
  delete r;
}

static void test_through_root() {
  // 4-2-1-3 is the longest path -> 3 edges.
  TreeNode* t = build({1, 2, 3, 4, 5});
  CHECK(tree_diameter(t) == 3);
  destroy(t);
}

static void test_single() {
  TreeNode* t = build({1});
  CHECK(tree_diameter(t) == 0);
  destroy(t);
}

static void test_empty() {
  CHECK(tree_diameter(nullptr) == 0);
}

static void test_two_nodes() {
  TreeNode* t = build({1, 2});
  CHECK(tree_diameter(t) == 1);
  destroy(t);
}

static void test_complete_tree() {
  // 4-2-1-3-6 -> 4 edges.
  TreeNode* t = build({1, 2, 3, 4, 5, 6, 7});
  CHECK(tree_diameter(t) == 4);
  destroy(t);
}

static void test_skewed_chain() {
  TreeNode* t = build({1, 2, NUL, 3, NUL, 4});
  CHECK(tree_diameter(t) == 3);
  destroy(t);
}

int main() {
  test_through_root();
  test_single();
  test_empty();
  test_two_nodes();
  test_complete_tree();
  test_skewed_chain();
  return REPORT();
}
