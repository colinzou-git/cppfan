// Reference solution for linked-list-reverse.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

struct ListNode {
  int val;
  ListNode* next;
  explicit ListNode(int v) : val(v), next(nullptr) {}
};

// Reverse a singly linked list in place; return the new head. O(n), O(1) space.
inline ListNode* reverse_list(ListNode* head) {
  ListNode* prev = nullptr;
  while (head != nullptr) {
    ListNode* next = head->next;
    head->next = prev;
    prev = head;
    head = next;
  }
  return prev;
}
