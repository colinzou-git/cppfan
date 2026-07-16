// Exercise: linked-list-palindrome
// Return true iff the singly linked list reads the same forwards and backwards.
//
// Rules:
//  - `is_palindrome(head)` returns whether the value sequence is a palindrome.
//  - An empty list and a single node are palindromes.
//  - The simplest approach copies values into a vector and checks with two
//    pointers; O(1)-space solutions reverse the second half.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

struct ListNode {
  int val;
  ListNode* next;
  explicit ListNode(int v) : val(v), next(nullptr) {}
};

inline bool is_palindrome(ListNode* head) {
  // TODO: compare the value sequence against its reverse.
  (void)head;
  return false;
}
