# Graphs: clone an undirected graph

**Skills:** graph DFS, graph representation, pointers
· **Difficulty:** advanced · **~40 min**

Deep-copy a connected undirected graph.

## Requirements

- Given a reference to any node, return an independent copy of the whole
  reachable graph: every node and edge duplicated.
- The clone must share **no** pointers with the original (a true deep copy).
- Preserve each node's `val` and its full neighbor set.
- `clone_graph(nullptr)` returns `nullptr`.

Hint: map each original node to its copy while you traverse, so shared neighbors
and cycles are copied exactly once.

Edit only `clone_graph.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh graph-clone-undirected
# ...edit exercises/graph-clone-undirected/work/clone_graph.hpp...
scripts/exercises/test.sh graph-clone-undirected
scripts/exercises/reset.sh graph-clone-undirected
```

When all tests pass, mark the exercise complete in cppFan.
