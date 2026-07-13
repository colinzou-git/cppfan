// Reference solution for heap-merge-k-sorted-lists.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <queue>
#include <vector>

struct ListNode {
  int val;
  ListNode* next;
  explicit ListNode(int v) : val(v), next(nullptr) {}
};

// Merge k already-sorted linked lists into one sorted list, reusing the existing
// nodes (no new allocation). A min-heap of the current heads gives O(N log k).
inline ListNode* merge_k_lists(std::vector<ListNode*> lists) {
  auto greater = [](ListNode* a, ListNode* b) { return a->val > b->val; };
  std::priority_queue<ListNode*, std::vector<ListNode*>, decltype(greater)> heap(greater);
  for (ListNode* head : lists) {
    if (head != nullptr) {
      heap.push(head);
    }
  }

  ListNode dummy(0);
  ListNode* tail = &dummy;
  while (!heap.empty()) {
    ListNode* node = heap.top();
    heap.pop();
    if (node->next != nullptr) {
      heap.push(node->next);
    }
    tail->next = node;
    tail = node;
  }
  tail->next = nullptr;
  return dummy.next;
}
