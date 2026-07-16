// Tests for linked-list-remove-elements. Build with -I _harness and the impl dir.
#include <initializer_list>
#include <vector>

#include "check.hpp"
#include "remove_elements.hpp"

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

static void test_removes_middle() {
  ListNode* r = remove_elements(build({1, 2, 6, 3, 6}), 6);
  CHECK((to_vec(r) == std::vector<int>{1, 2, 3}));
  free_list(r);
}

static void test_removes_head() {
  ListNode* r = remove_elements(build({7, 7, 1, 2}), 7);
  CHECK((to_vec(r) == std::vector<int>{1, 2}));
  free_list(r);
}

static void test_removes_all() {
  ListNode* r = remove_elements(build({5, 5, 5}), 5);
  CHECK((to_vec(r).empty()));
  free_list(r);
}

static void test_removes_none() {
  ListNode* r = remove_elements(build({1, 2, 3}), 9);
  CHECK((to_vec(r) == std::vector<int>{1, 2, 3}));
  free_list(r);
}

static void test_empty() {
  ListNode* r = remove_elements(nullptr, 1);
  CHECK(r == nullptr);
}

int main() {
  test_removes_middle();
  test_removes_head();
  test_removes_all();
  test_removes_none();
  test_empty();
  return REPORT();
}
