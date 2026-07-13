// Exercise: linked-list-detect-cycle
// Detect whether a singly linked list contains a cycle.
//
// Rules:
//  - Return true when following `next` pointers eventually revisits a node.
//  - Use Floyd's tortoise-and-hare: O(n) time, O(1) extra space (no visited set).
//  - An empty list has no cycle.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

struct ListNode {
  int val;
  ListNode* next;
  explicit ListNode(int v) : val(v), next(nullptr) {}
};

inline bool has_cycle(ListNode* head) {
  // TODO: advance a slow pointer by 1 and a fast pointer by 2; a cycle exists
  // when they meet.
  (void)head;
  return false;
}
