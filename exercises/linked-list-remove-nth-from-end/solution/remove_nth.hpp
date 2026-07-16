// Reference solution for linked-list-remove-nth-from-end.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

struct ListNode {
  int val;
  ListNode* next;
  explicit ListNode(int v) : val(v), next(nullptr) {}
};

inline ListNode* remove_nth(ListNode* head, int n) {
  ListNode dummy(0);
  dummy.next = head;
  ListNode* lead = &dummy;
  ListNode* trail = &dummy;
  for (int i = 0; i < n; ++i) {
    lead = lead->next;
  }
  while (lead->next != nullptr) {
    lead = lead->next;
    trail = trail->next;
  }
  ListNode* target = trail->next;
  trail->next = target->next;
  delete target;
  return dummy.next;
}
