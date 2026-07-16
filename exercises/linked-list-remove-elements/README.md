# Linked list: remove elements

Remove **every** node whose value equals `val` from a singly linked list and
return the (possibly new) head.

Implement `remove_elements` in `remove_elements.hpp`:

```cpp
ListNode* remove_elements(ListNode* head, int val);
```

Approach:
- A leading **dummy node** before the head makes removing the real head the same
  as removing any other node.
- Walk with a `prev` pointer; when `prev->next->val == val`, unlink it
  (`prev->next = prev->next->next`) and `delete` the removed node (no leaks —
  ASan checks).
- Only advance `prev` when you did **not** remove, so consecutive matches are all
  handled.

Example: `1 -> 2 -> 6 -> 3 -> 6`, `val = 6` → `1 -> 2 -> 3`.

Only edit `remove_elements.hpp`. Do not change the interface or the tests.
