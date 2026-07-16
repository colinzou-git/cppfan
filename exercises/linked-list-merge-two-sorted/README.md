# Linked list: merge two sorted lists

Implement `merge_two(a, b)`: merge two **ascending** sorted singly linked lists
into one ascending sorted list and return its head.

## Approach

1. Use a **dummy head** node so the first append needs no special case.
2. Walk both lists with a `tail` pointer. Append whichever current node is
   smaller (`<=` keeps it stable) and advance that list.
3. When one list is exhausted, attach the remainder of the other directly.

Reuse the existing nodes — no new value nodes are allocated.

## Examples

| a | b | Output |
|---|---|---|
| `1 → 3 → 5` | `2 → 4 → 6` | `1 → 2 → 3 → 4 → 5 → 6` |
| `∅` | `0 → 7 → 9` | `0 → 7 → 9` |
| `1 → 2 → 2` | `2 → 3` | `1 → 2 → 2 → 2 → 3` |

## Files

- `starter/merge_two.hpp` — implement here.
- `tests/tests.cpp` — the checks your solution must pass.
