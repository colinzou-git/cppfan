// Exercise: heap-merge-k-sorted-lists
// Merge k sorted linked lists into one sorted list.
//
// Rules:
//  - Each input list is already sorted ascending.
//  - Reuse the existing nodes (splice them together); do not allocate new nodes.
//  - Return the head of the merged sorted list (nullptr if everything is empty).
//  - Use a min-heap of the current list heads for O(N log k).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <queue>
#include <vector>

struct ListNode {
  int val;
  ListNode* next;
  explicit ListNode(int v) : val(v), next(nullptr) {}
};

inline ListNode* merge_k_lists(std::vector<ListNode*> lists) {
  // TODO: push each list head into a min-heap; repeatedly pop the smallest, then
  // push its next, splicing nodes onto the result tail.
  (void)lists;
  return nullptr;
}
