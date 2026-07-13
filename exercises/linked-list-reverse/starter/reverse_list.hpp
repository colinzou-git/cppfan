// Exercise: linked-list-reverse
// Reverse a singly linked list in place and return the new head.
//
// Rules:
//  - Reverse the direction of every `next` pointer; do not allocate new nodes.
//  - Return the new head (the old tail). An empty list (nullptr) returns nullptr.
//  - O(n) time, O(1) extra space.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

struct ListNode {
  int val;
  ListNode* next;
  explicit ListNode(int v) : val(v), next(nullptr) {}
};

inline ListNode* reverse_list(ListNode* head) {
  // TODO: walk the list, repointing each node's next to the previous node.
  return head;
}
