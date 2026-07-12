# STL: top-k with a heap

**Skills:** container adapters (priority_queue), STL algorithms, traversal
· **Difficulty:** intermediate · **~25 min**

Return the k largest values in descending order using a priority queue.

## Requirements

- Result is the k largest values, in descending order (duplicates kept).
- `k <= 0` → empty result.
- `k >= values.size()` → every value, sorted descending.

A `std::priority_queue<int>` is a max-heap: `top()` is the largest.

Edit only `top_k.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh priority-queue-top-k
# ...edit exercises/priority-queue-top-k/work/top_k.hpp...
scripts/exercises/test.sh priority-queue-top-k
scripts/exercises/reset.sh priority-queue-top-k
```

When all tests pass, mark the exercise complete in cppFan.
