// Exercise: linked-list-merge-two-sorted
// Merge two ascending sorted singly linked lists into one ascending sorted list.
//
// Rules:
//  - `merge_two(a, b)` returns the head of the merged list.
//  - Reuse the existing nodes (do not allocate new value nodes); a dummy head
//    node is the easiest way to build the result.
//  - Either input may be empty (nullptr).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

struct ListNode {
  int val;
  ListNode* next;
  explicit ListNode(int v) : val(v), next(nullptr) {}
};

inline ListNode* merge_two(ListNode* a, ListNode* b) {
  // TODO: splice nodes from a and b in sorted order; attach the leftover tail.
  (void)a;
  (void)b;
  return nullptr;
}
