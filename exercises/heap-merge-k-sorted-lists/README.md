# Heaps: merge k sorted lists

**Skills:** heaps, heap applications, linked lists
· **Difficulty:** advanced · **~40 min**

Merge k sorted linked lists into one sorted list.

## Requirements

- Each input list is already sorted ascending.
- Reuse the existing nodes (splice them together); do not allocate new nodes.
- Return the head of the merged sorted list (`nullptr` if everything is empty).
- Use a min-heap of the current list heads for O(N log k).

Edit only `merge_k_lists.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh heap-merge-k-sorted-lists
# ...edit exercises/heap-merge-k-sorted-lists/work/merge_k_lists.hpp...
scripts/exercises/test.sh heap-merge-k-sorted-lists
scripts/exercises/reset.sh heap-merge-k-sorted-lists
```

When all tests pass, mark the exercise complete in cppFan.
