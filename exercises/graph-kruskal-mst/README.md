# Graphs: Kruskal minimum spanning tree

**Skills:** minimum spanning tree, union-find, comparators
· **Difficulty:** advanced · **~40 min**

Compute the total weight of a minimum spanning tree.

## Requirements

- Undirected weighted graph, vertices `0..n-1`.
- Return the total weight of a minimum spanning tree.
- Return `-1` if the graph is not connected (no spanning tree exists).
- Kruskal's algorithm: sort edges by weight, add an edge when it joins two
  different components (union-find), stop after `n-1` edges.

Edit only `kruskal.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh graph-kruskal-mst
# ...edit exercises/graph-kruskal-mst/work/kruskal.hpp...
scripts/exercises/test.sh graph-kruskal-mst
scripts/exercises/reset.sh graph-kruskal-mst
```

When all tests pass, mark the exercise complete in cppFan.
