// Tests for linked-list-palindrome. Build with -I _harness and the impl dir.
#include <initializer_list>

#include "check.hpp"
#include "is_palindrome.hpp"

static ListNode* build(std::initializer_list<int> vals) {
  ListNode* head = nullptr;
  ListNode** tail = &head;
  for (int v : vals) {
    *tail = new ListNode(v);
    tail = &(*tail)->next;
  }
  return head;
}

static void free_list(ListNode* h) {
  while (h != nullptr) {
    ListNode* n = h->next;
    delete h;
    h = n;
  }
}

static void test_even() {
  ListNode* h = build({1, 2, 2, 1});
  CHECK(is_palindrome(h) == true);
  free_list(h);
}

static void test_odd() {
  ListNode* h = build({1, 2, 3, 2, 1});
  CHECK(is_palindrome(h) == true);
  free_list(h);
}

static void test_not() {
  ListNode* h = build({1, 2, 3});
  CHECK(is_palindrome(h) == false);
  ListNode* h2 = build({1, 2, 2, 3});
  CHECK(is_palindrome(h2) == false);
  free_list(h);
  free_list(h2);
}

static void test_single() {
  ListNode* h = build({42});
  CHECK(is_palindrome(h) == true);
  free_list(h);
}

static void test_empty() {
  CHECK(is_palindrome(nullptr) == true);
}

int main() {
  test_even();
  test_odd();
  test_not();
  test_single();
  test_empty();
  return REPORT();
}
