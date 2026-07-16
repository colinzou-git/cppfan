// Tests for tree-sum-values. Build with -I _harness and the impl dir.
#include <climits>
#include <queue>
#include <vector>

#include "check.hpp"
#include "tree_sum.hpp"

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
  TreeNode* t = build({1, 2, 3, 4, 5, 6, 7});  // 1+2+3+4+5+6+7 = 28
  CHECK(tree_sum(t) == 28);
  destroy(t);
}

static void test_single() {
  TreeNode* t = build({42});
  CHECK(tree_sum(t) == 42);
  destroy(t);
}

static void test_empty() {
  CHECK(tree_sum(nullptr) == 0);
}

static void test_negatives() {
  TreeNode* t = build({5, -3, 8, NUL, NUL, -2});  // 5 - 3 + 8 - 2 = 8
  CHECK(tree_sum(t) == 8);
  destroy(t);
}

static void test_skewed() {
  TreeNode* t = build({1, 2, NUL, 3, NUL, 4});  // 1 + 2 + 3 + 4 = 10
  CHECK(tree_sum(t) == 10);
  destroy(t);
}

int main() {
  test_balanced();
  test_single();
  test_empty();
  test_negatives();
  test_skewed();
  return REPORT();
}
