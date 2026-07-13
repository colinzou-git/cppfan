# Linked list: detect a cycle

**Skills:** linked lists, pointers, cycle detection
· **Difficulty:** intermediate · **~25 min**

Detect whether a singly linked list contains a cycle.

## Requirements

- Return `true` when following `next` pointers eventually revisits a node.
- Use Floyd's tortoise-and-hare: O(n) time, O(1) extra space (no visited set).
- An empty list has no cycle.

Edit only `detect_cycle.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh linked-list-detect-cycle
# ...edit exercises/linked-list-detect-cycle/work/detect_cycle.hpp...
scripts/exercises/test.sh linked-list-detect-cycle
scripts/exercises/reset.sh linked-list-detect-cycle
```

When all tests pass, mark the exercise complete in cppFan.
