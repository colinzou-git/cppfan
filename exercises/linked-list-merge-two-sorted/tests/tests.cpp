// Tests for linked-list-merge-two-sorted. Build with -I _harness and the impl dir.
#include <initializer_list>
#include <vector>

#include "check.hpp"
#include "merge_two.hpp"

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

static void test_basic() {
  ListNode* merged = merge_two(build({1, 3, 5}), build({2, 4, 6}));
  CHECK((to_vec(merged) == std::vector<int>{1, 2, 3, 4, 5, 6}));
  free_list(merged);
}

static void test_one_empty() {
  ListNode* merged = merge_two(nullptr, build({0, 7, 9}));
  CHECK((to_vec(merged) == std::vector<int>{0, 7, 9}));
  free_list(merged);
  ListNode* merged2 = merge_two(build({2, 4}), nullptr);
  CHECK((to_vec(merged2) == std::vector<int>{2, 4}));
  free_list(merged2);
}

static void test_both_empty() {
  CHECK(merge_two(nullptr, nullptr) == nullptr);
}

static void test_duplicates() {
  ListNode* merged = merge_two(build({1, 2, 2}), build({2, 3}));
  CHECK((to_vec(merged) == std::vector<int>{1, 2, 2, 2, 3}));
  free_list(merged);
}

static void test_disjoint() {
  ListNode* merged = merge_two(build({1, 2, 3}), build({7, 8, 9}));
  CHECK((to_vec(merged) == std::vector<int>{1, 2, 3, 7, 8, 9}));
  free_list(merged);
}

int main() {
  test_basic();
  test_one_empty();
  test_both_empty();
  test_duplicates();
  test_disjoint();
  return REPORT();
}
