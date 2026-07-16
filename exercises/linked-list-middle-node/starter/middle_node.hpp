// Exercise: linked-list-middle-node
// Return the middle node of a singly linked list. For an even number of nodes,
// return the SECOND of the two middle nodes.
//
// Rules:
//  - `middle_node(head)` returns a pointer to the middle node (nullptr if empty).
//  - Use the slow/fast two-pointer technique in one pass.
//  - Do not modify the list; just return the node.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

struct ListNode {
  int val;
  ListNode* next;
  explicit ListNode(int v) : val(v), next(nullptr) {}
};

inline ListNode* middle_node(ListNode* head) {
  // TODO: advance slow by 1 and fast by 2; return slow when fast runs out.
  return head;
}
