// Exercise: linked-list-remove-nth-from-end
// Remove the nth node counting from the END of the list (n is 1-based) and
// return the head. Delete the removed node so no memory leaks.
//
// Rules:
//  - A dummy node before the head removes the special case of deleting the head.
//  - Advance a lead pointer n steps, then move lead and a trailing pointer
//    together until lead hits the end; trail then sits just before the target.
//  - 1 <= n <= length of the list.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

struct ListNode {
  int val;
  ListNode* next;
  explicit ListNode(int v) : val(v), next(nullptr) {}
};

inline ListNode* remove_nth(ListNode* head, int n) {
  // TODO: two-pointer gap of n; splice out and delete the target node.
  (void)n;
  return head;
}
