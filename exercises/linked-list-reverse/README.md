# Linked list: reverse in place

**Skills:** linked lists, pointers, list vs vector
· **Difficulty:** beginner · **~25 min**

Reverse a singly linked list in place and return the new head.

## Requirements

- Reverse the direction of every `next` pointer; do not allocate new nodes.
- Return the new head (the old tail). An empty list (`nullptr`) returns `nullptr`.
- O(n) time, O(1) extra space.

Edit only `reverse_list.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh linked-list-reverse
# ...edit exercises/linked-list-reverse/work/reverse_list.hpp...
scripts/exercises/test.sh linked-list-reverse
scripts/exercises/reset.sh linked-list-reverse
```

When all tests pass, mark the exercise complete in cppFan.
