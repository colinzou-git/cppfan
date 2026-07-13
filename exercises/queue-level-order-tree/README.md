# Trees: level-order traversal

**Skills:** tree traversal, BFS, container adapters (queue)
· **Difficulty:** intermediate · **~30 min**

Return the level-order (breadth-first) traversal of a binary tree.

## Requirements

- Produce one inner vector per level, top to bottom, left to right.
- An empty tree (`nullptr`) yields an empty result.
- Use a queue to visit nodes breadth-first; process one full level at a time by
  capturing the queue size before the level loop.

Edit only `level_order.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh queue-level-order-tree
# ...edit exercises/queue-level-order-tree/work/level_order.hpp...
scripts/exercises/test.sh queue-level-order-tree
scripts/exercises/reset.sh queue-level-order-tree
```

When all tests pass, mark the exercise complete in cppFan.
