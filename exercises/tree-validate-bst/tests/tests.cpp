// Tests for tree-validate-bst. Build with -I _harness and the impl dir.
#include <climits>
#include <queue>
#include <vector>

#include "check.hpp"
#include "is_valid_bst.hpp"

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

static void test_valid() {
  TreeNode* t = build({2, 1, 3});
  CHECK(is_valid_bst(t) == true);
  destroy(t);
}

static void test_invalid_right() {
  // 4 sits in 5's right subtree but is not > 5
  TreeNode* t = build({5, 1, 4, NUL, NUL, 3, 6});
  CHECK(is_valid_bst(t) == false);
  destroy(t);
}

static void test_invalid_deep() {
  // 6 is locally fine under 15, but violates the ancestor bound from 10
  TreeNode* t = build({10, 5, 15, NUL, NUL, 6, 20});
  CHECK(is_valid_bst(t) == false);
  destroy(t);
}

static void test_single() {
  TreeNode* t = build({1});
  CHECK(is_valid_bst(t) == true);
  CHECK(is_valid_bst(nullptr) == true);  // empty tree is valid
  destroy(t);
}

static void test_duplicates() {
  TreeNode* t = build({2, 2});
  CHECK(is_valid_bst(t) == false);  // strict: equal values not allowed
  destroy(t);
}

int main() {
  test_valid();
  test_invalid_right();
  test_invalid_deep();
  test_single();
  test_duplicates();
  return REPORT();
}
