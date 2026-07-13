# Graphs: bipartite check

**Skills:** bipartite/coloring, BFS, graph representation
· **Difficulty:** intermediate · **~30 min**

Decide whether an undirected graph can be 2-colored (is bipartite).

## Requirements

- Vertices are `0..n-1`; `edges` is an undirected edge list.
- Return `true` iff every vertex can take one of two colors so that no edge
  joins two same-colored vertices.
- The graph may be disconnected — check every component.
- BFS/DFS coloring works; give each neighbor the opposite color.

Edit only `bipartite.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh graph-bipartite-coloring
# ...edit exercises/graph-bipartite-coloring/work/bipartite.hpp...
scripts/exercises/test.sh graph-bipartite-coloring
scripts/exercises/reset.sh graph-bipartite-coloring
```

When all tests pass, mark the exercise complete in cppFan.
