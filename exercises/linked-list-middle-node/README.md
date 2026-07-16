# Linked list: middle node

Return the **middle node** of a singly linked list. For an even number of nodes,
return the **second** of the two middle nodes.

Implement `middle_node` in `middle_node.hpp`:

```cpp
ListNode* middle_node(ListNode* head);
```

Approach:
- Use two pointers: a `slow` one advancing **one** step and a `fast` one
  advancing **two** steps.
- When `fast` reaches the end (`fast == nullptr` or `fast->next == nullptr`),
  `slow` is at the middle.
- This returns the second middle for an even length. Do not modify the list.

Examples: `1 -> 2 -> 3 -> 4 -> 5` → node `3`; `1 -> 2 -> 3 -> 4 -> 5 -> 6` → node
`4`.

Only edit `middle_node.hpp`. Do not change the interface or the tests.
