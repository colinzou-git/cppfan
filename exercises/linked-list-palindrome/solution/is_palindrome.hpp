// Reference solution for linked-list-palindrome.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <cstddef>
#include <vector>

struct ListNode {
  int val;
  ListNode* next;
  explicit ListNode(int v) : val(v), next(nullptr) {}
};

inline bool is_palindrome(ListNode* head) {
  std::vector<int> vals;
  for (ListNode* c = head; c != nullptr; c = c->next) {
    vals.push_back(c->val);
  }
  std::size_t i = 0;
  std::size_t j = vals.size();
  while (i + 1 < j) {
    if (vals[i] != vals[j - 1]) {
      return false;
    }
    ++i;
    --j;
  }
  return true;
}
