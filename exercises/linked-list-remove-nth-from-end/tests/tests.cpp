// Tests for linked-list-remove-nth-from-end. Build with -I _harness and the impl dir.
#include <initializer_list>
#include <vector>

#include "check.hpp"
#include "remove_nth.hpp"

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

static void test_middle() {
  ListNode* h = remove_nth(build({1, 2, 3, 4, 5}), 2);  // remove 4
  CHECK((to_vec(h) == std::vector<int>{1, 2, 3, 5}));
  free_list(h);
}

static void test_head() {
  ListNode* h = remove_nth(build({1, 2, 3}), 3);  // remove 1
  CHECK((to_vec(h) == std::vector<int>{2, 3}));
  free_list(h);
}

static void test_tail() {
  ListNode* h = remove_nth(build({1, 2, 3, 4, 5}), 1);  // remove 5
  CHECK((to_vec(h) == std::vector<int>{1, 2, 3, 4}));
  free_list(h);
}

static void test_single() {
  ListNode* h = remove_nth(build({42}), 1);  // list becomes empty
  CHECK(h == nullptr);
  free_list(h);
}

static void test_second_of_two() {
  ListNode* h = remove_nth(build({1, 2}), 1);  // remove 2
  CHECK((to_vec(h) == std::vector<int>{1}));
  free_list(h);
}

int main() {
  test_middle();
  test_head();
  test_tail();
  test_single();
  test_second_of_two();
  return REPORT();
}
