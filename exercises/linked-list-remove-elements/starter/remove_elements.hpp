// Exercise: linked-list-remove-elements
// Remove every node whose value equals `val` from a singly linked list and
// return the (possibly new) head.
//
// Rules:
//  - `remove_elements(head, val)` returns the head after deleting all matches.
//  - A leading dummy node simplifies removing the real head.
//  - delete each unlinked node so there are no leaks (checked under ASan).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

struct ListNode {
  int val;
  ListNode* next;
  explicit ListNode(int v) : val(v), next(nullptr) {}
};

inline ListNode* remove_elements(ListNode* head, int val) {
  // TODO: use a dummy node; unlink and delete nodes whose value is val.
  (void)val;
  return head;
}
