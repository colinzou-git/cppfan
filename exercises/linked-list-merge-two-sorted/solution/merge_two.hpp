// Reference solution for linked-list-merge-two-sorted.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

struct ListNode {
  int val;
  ListNode* next;
  explicit ListNode(int v) : val(v), next(nullptr) {}
};

inline ListNode* merge_two(ListNode* a, ListNode* b) {
  ListNode dummy(0);
  ListNode* tail = &dummy;
  while (a != nullptr && b != nullptr) {
    if (a->val <= b->val) {
      tail->next = a;
      a = a->next;
    } else {
      tail->next = b;
      b = b->next;
    }
    tail = tail->next;
  }
  tail->next = (a != nullptr) ? a : b;
  return dummy.next;
}
