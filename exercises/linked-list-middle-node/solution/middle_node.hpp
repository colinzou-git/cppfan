// Reference solution for linked-list-middle-node.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

struct ListNode {
  int val;
  ListNode* next;
  explicit ListNode(int v) : val(v), next(nullptr) {}
};

inline ListNode* middle_node(ListNode* head) {
  ListNode* slow = head;
  ListNode* fast = head;
  while (fast != nullptr && fast->next != nullptr) {
    slow = slow->next;        // one step
    fast = fast->next->next;  // two steps
  }
  return slow;  // second middle for even lengths
}
