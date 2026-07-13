// Tests for queue-level-order-tree. Build with -I _harness and the impl dir.
#include <climits>
#include <queue>
#include <vector>

#include "check.hpp"
#include "level_order.hpp"

static const int NUL = INT_MIN;

// Build a tree from a level-order array (NUL marks a missing child).
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

using VV = std::vector<std::vector<int>>;

static void test_typical() {
  TreeNode* t = build({3, 9, 20, NUL, NUL, 15, 7});
  CHECK((level_order(t) == VV{{3}, {9, 20}, {15, 7}}));
  destroy(t);
}

static void test_single() {
  TreeNode* t = build({1});
  CHECK((level_order(t) == VV{{1}}));
  destroy(t);
}

static void test_empty() {
  CHECK(level_order(nullptr).empty());
}

static void test_left_skewed() {
  TreeNode* t = build({1, 2, NUL, 3});
  CHECK((level_order(t) == VV{{1}, {2}, {3}}));
  destroy(t);
}

static void test_complete() {
  TreeNode* t = build({1, 2, 3, 4, 5, 6, 7});
  CHECK((level_order(t) == VV{{1}, {2, 3}, {4, 5, 6, 7}}));
  destroy(t);
}

int main() {
  test_typical();
  test_single();
  test_empty();
  test_left_skewed();
  test_complete();
  return REPORT();
}
