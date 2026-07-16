// Tests for linked-list-middle-node. Build with -I _harness and the impl dir.
#include <initializer_list>
#include <vector>

#include "check.hpp"
#include "middle_node.hpp"

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

static void test_odd_length() {
  ListNode* head = build({1, 2, 3, 4, 5});
  ListNode* mid = middle_node(head);
  CHECK(mid != nullptr && mid->val == 3);
  CHECK((to_vec(mid) == std::vector<int>{3, 4, 5}));  // middle to end
  free_list(head);
}

static void test_even_length() {
  ListNode* head = build({1, 2, 3, 4, 5, 6});
  ListNode* mid = middle_node(head);
  CHECK(mid != nullptr && mid->val == 4);  // second of the two middles
  free_list(head);
}

static void test_single() {
  ListNode* head = build({42});
  CHECK(middle_node(head)->val == 42);
  free_list(head);
}

static void test_two() {
  ListNode* head = build({10, 20});
  CHECK(middle_node(head)->val == 20);  // second middle
  free_list(head);
}

static void test_five() {
  ListNode* head = build({1, 2, 3, 4, 5});
  CHECK(middle_node(head)->val == 3);
  free_list(head);
}

int main() {
  test_odd_length();
  test_even_length();
  test_single();
  test_two();
  test_five();
  return REPORT();
}
