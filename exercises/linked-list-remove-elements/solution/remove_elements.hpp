// Reference solution for linked-list-remove-elements.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

struct ListNode {
  int val;
  ListNode* next;
  explicit ListNode(int v) : val(v), next(nullptr) {}
};

inline ListNode* remove_elements(ListNode* head, int val) {
  ListNode dummy(0);
  dummy.next = head;
  ListNode* prev = &dummy;
  while (prev->next != nullptr) {
    if (prev->next->val == val) {
      ListNode* doomed = prev->next;
      prev->next = doomed->next;  // unlink
      delete doomed;              // free (no leak)
    } else {
      prev = prev->next;
    }
  }
  return dummy.next;
}
