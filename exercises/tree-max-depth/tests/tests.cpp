// Tests for tree-max-depth. Build with -I _harness and the impl dir.
#include <climits>
#include <queue>
#include <vector>

#include "check.hpp"
#include "max_depth.hpp"

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
      if (vals[i] != NUL) { n->left = new TreeNode(vals[i]); q.push(n->left); }
      ++i;
    }
    if (i < vals.size()) {
      if (vals[i] != NUL) { n->right = new TreeNode(vals[i]); q.push(n->right); }
      ++i;
    }
  }
  return root;
}

static void destroy(TreeNode* r) {
  if (r == nullptr) return;
  destroy(r->left);
  destroy(r->right);
  delete r;
}

static void test_balanced() {
  TreeNode* t = build({1, 2, 3, 4, 5, 6, 7});  // full tree of depth 3
  CHECK(max_depth(t) == 3);
  destroy(t);
}

static void test_left_skewed() {
  TreeNode* t = build({1, 2, NUL, 3, NUL, 4});  // a left chain of 4
  CHECK(max_depth(t) == 4);
  destroy(t);
}

static void test_single() {
  TreeNode* t = build({42});
  CHECK(max_depth(t) == 1);
  destroy(t);
}

static void test_empty() {
  CHECK(max_depth(nullptr) == 0);
}

static void test_unbalanced() {
  TreeNode* t = build({3, 9, 20, NUL, NUL, 15, 7});  // depth 3
  CHECK(max_depth(t) == 3);
  destroy(t);
}

int main() {
  test_balanced();
  test_left_skewed();
  test_single();
  test_empty();
  test_unbalanced();
  return REPORT();
}
