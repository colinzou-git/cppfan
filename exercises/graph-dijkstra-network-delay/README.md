# Graphs: Dijkstra network delay

**Skills:** shortest paths, Dijkstra, graph representation
· **Difficulty:** advanced · **~40 min**

Find how long a signal takes to reach every node from a source.

## Requirements

- Directed graph, nodes `0..n-1`, non-negative edge weights (travel times).
- Return the time to reach **all** nodes = the maximum of the shortest-path
  distances from `source`.
- Return `-1` if any node is unreachable.
- Use Dijkstra with a min-heap: O((V + E) log V).

Edit only `network_delay.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh graph-dijkstra-network-delay
# ...edit exercises/graph-dijkstra-network-delay/work/network_delay.hpp...
scripts/exercises/test.sh graph-dijkstra-network-delay
scripts/exercises/reset.sh graph-dijkstra-network-delay
```

When all tests pass, mark the exercise complete in cppFan.
