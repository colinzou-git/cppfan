// Tests for tree-path-sum. Build with -I _harness and the impl dir.
#include <climits>
#include <queue>
#include <vector>

#include "check.hpp"
#include "has_path_sum.hpp"

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

static void test_basic() {
  // 5->4->11->2 == 22
  TreeNode* t = build({5, 4, 8, 11, NUL, 13, 4, 7, 2});
  CHECK(has_path_sum(t, 22) == true);
  CHECK(has_path_sum(t, 27) == true);  // 5->4->11->7
  destroy(t);
}

static void test_missing() {
  TreeNode* t = build({5, 4, 8, 11, NUL, 13, 4, 7, 2});
  CHECK(has_path_sum(t, 100) == false);
  CHECK(has_path_sum(t, 5) == false);  // 5 is not a leaf
  destroy(t);
}

static void test_single() {
  TreeNode* t = build({7});
  CHECK(has_path_sum(t, 7) == true);
  CHECK(has_path_sum(t, 3) == false);
  destroy(t);
}

static void test_empty() {
  CHECK(has_path_sum(nullptr, 0) == false);
}

static void test_negatives() {
  // 1->-2 == -1 (leaf); 1->3 == 4 (leaf)
  TreeNode* t = build({1, -2, 3});
  CHECK(has_path_sum(t, -1) == true);
  CHECK(has_path_sum(t, 4) == true);
  CHECK(has_path_sum(t, 1) == false);
  destroy(t);
}

int main() {
  test_basic();
  test_missing();
  test_single();
  test_empty();
  test_negatives();
  return REPORT();
}
