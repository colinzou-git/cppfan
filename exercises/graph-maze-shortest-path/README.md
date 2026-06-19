# Graph: shortest path through a maze

**Skills:** BFS, grid-as-graph modeling, shortest paths
**Difficulty:** intermediate - **~30 min**

Given a rectangular grid maze, return the fewest number of 4-directional moves
from `S` to `G`. A `#` is a wall; any other cell is open. Return `-1` when the
goal cannot be reached or the grid is malformed. A one-cell grid containing only
`S` represents "already at the goal" and returns `0`.

## Requirements

- Use BFS with a queue, not DFS or exhaustive path enumeration.
- Mark cells visited when you enqueue them.
- Return the distance when `G` is first reached.
- Run in O(rows * cols) time and O(rows * cols) space.

Edit only `maze_route.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh graph-maze-shortest-path
# ...edit exercises/graph-maze-shortest-path/work/maze_route.hpp...
scripts/exercises/test.sh graph-maze-shortest-path
scripts/exercises/reset.sh graph-maze-shortest-path
```

When all tests pass, mark the exercise complete in cppFan.
