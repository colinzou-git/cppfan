// Tests for heap-merge-k-sorted-lists. Build with -I _harness and the impl dir.
#include <initializer_list>
#include <vector>

#include "check.hpp"
#include "merge_k_lists.hpp"

static ListNode* build(std::initializer_list<int> vals) {
  ListNode* head = nullptr;
  ListNode** tail = &head;
  for (int v : vals) {
    *tail = new ListNode(v);
    tail = &(*tail)->next;
  }
  return head;
}

static std::vector<int> to_vec(ListNode* h) {
  std::vector<int> out;
  while (h != nullptr) {
    out.push_back(h->val);
    h = h->next;
  }
  return out;
}

static void free_list(ListNode* h) {
  while (h != nullptr) {
    ListNode* n = h->next;
    delete h;
    h = n;
  }
}

static void test_three_lists() {
  ListNode* merged = merge_k_lists({build({1, 4, 5}), build({1, 3, 4}), build({2, 6})});
  CHECK((to_vec(merged) == std::vector<int>{1, 1, 2, 3, 4, 4, 5, 6}));
  free_list(merged);
}

static void test_with_empty_lists() {
  ListNode* merged = merge_k_lists({build({}), build({1}), build({}), build({0, 2})});
  CHECK((to_vec(merged) == std::vector<int>{0, 1, 2}));
  free_list(merged);
}

static void test_single_list() {
  ListNode* merged = merge_k_lists({build({1, 2, 3})});
  CHECK((to_vec(merged) == std::vector<int>{1, 2, 3}));
  free_list(merged);
}

static void test_no_lists() {
  CHECK(merge_k_lists({}) == nullptr);
}

static void test_all_empty() {
  CHECK(merge_k_lists({build({}), build({})}) == nullptr);
}

static void test_handles_negatives() {
  ListNode* merged = merge_k_lists({build({-5, 0}), build({-3, 4})});
  CHECK((to_vec(merged) == std::vector<int>{-5, -3, 0, 4}));
  free_list(merged);
}

int main() {
  test_three_lists();
  test_with_empty_lists();
  test_single_list();
  test_no_lists();
  test_all_empty();
  test_handles_negatives();
  return REPORT();
}
