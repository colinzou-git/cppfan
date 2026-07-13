// Tests for linked-list-reverse. Build with -I _harness and the impl dir.
#include <initializer_list>
#include <vector>

#include "check.hpp"
#include "reverse_list.hpp"

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

static void test_reverses_three() {
  ListNode* r = reverse_list(build({1, 2, 3}));
  CHECK((to_vec(r) == std::vector<int>{3, 2, 1}));
  free_list(r);
}

static void test_reverses_two() {
  ListNode* r = reverse_list(build({1, 2}));
  CHECK((to_vec(r) == std::vector<int>{2, 1}));
  free_list(r);
}

static void test_single() {
  ListNode* r = reverse_list(build({7}));
  CHECK((to_vec(r) == std::vector<int>{7}));
  free_list(r);
}

static void test_empty() {
  CHECK(reverse_list(nullptr) == nullptr);
}

static void test_longer_list() {
  ListNode* r = reverse_list(build({10, 20, 30, 40, 50}));
  CHECK((to_vec(r) == std::vector<int>{50, 40, 30, 20, 10}));
  free_list(r);
}

int main() {
  test_reverses_three();
  test_reverses_two();
  test_single();
  test_empty();
  test_longer_list();
  return REPORT();
}
