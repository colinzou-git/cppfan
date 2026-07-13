# Union-find: number of islands

**Skills:** disjoint set (union-find), connected components, DSU internals
· **Difficulty:** advanced · **~40 min**

Count the islands in a grid of `'1'` (land) and `'0'` (water).

## Requirements

- Cells connect 4-directionally (up/down/left/right), not diagonally.
- An island is a maximal group of connected land cells. Return the count.
- An empty grid has 0 islands.

A disjoint-set (union-find) over the land cells is a clean approach; a DFS/BFS
flood fill also works. The tests only check the final count.

Edit only `num_islands.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh dsu-number-of-islands
# ...edit exercises/dsu-number-of-islands/work/num_islands.hpp...
scripts/exercises/test.sh dsu-number-of-islands
scripts/exercises/reset.sh dsu-number-of-islands
```

When all tests pass, mark the exercise complete in cppFan.
