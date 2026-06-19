-- Roadmap #75 / #115 final graph coverage: graph fixtures/traces, path
-- reconstruction, algorithm selection, MST trace, and offline connectivity.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.graphs.connected_components.code_grid_trace',
    'code_reading',
    'Trace a grid component',
    $prompt$A grid can be treated as an implicit graph: each open cell is a vertex and 4-directional neighbors are edges.

```text
S . #
. . #
# . G
```

Text equivalent: open cells are S at (0,0), dots at (0,1), (1,0), (1,1), (2,1), and G at (2,2); walls are at (0,2), (1,2), and (2,0). Starting from S, which open cells does BFS/DFS mark as the same component?$prompt$,
    $explanation$Using 4-directional moves, S reaches (0,1), (1,0), (1,1), and (2,1). From (2,1), BFS/DFS can move right to G at (2,2). The single component contains all six open cells.$explanation$,
    'intermediate',
    3,
    4832,
    true
  ),
  (
    'dsa.graphs.bfs.code_parent_trace',
    'code_reading',
    'Reconstruct a BFS path',
    $prompt$Diagram:

```text
0 -- 1 -- 3 -- 4
|         /
2 -------
```

Text equivalent: Undirected unweighted graph: 0 connects to 1 and 2; 1 connects to 3; 2 connects to 3; 3 connects to 4.

Run BFS from 0, visiting neighbors in increasing label order, and store parent[v] the first time each vertex is discovered. What path do you reconstruct from 0 to 4?$prompt$,
    $explanation$BFS discovers 1 and 2 from 0, then discovers 3 from 1 before seeing it again from 2, then discovers 4 from 3. Parent links are parent[1]=0, parent[2]=0, parent[3]=1, parent[4]=3. Reconstructing backward from 4 gives 4 <- 3 <- 1 <- 0, so the path is 0 -> 1 -> 3 -> 4.$explanation$,
    'intermediate',
    3,
    4834,
    true
  ),
  (
    'dsa.graphs.shortest_path_algorithms.mc_select_conditions',
    'multiple_choice',
    'Select by graph conditions',
    $prompt$You need shortest paths from one start vertex. The graph is directed, weighted, and may contain negative edges, but you also need to detect whether a reachable negative cycle exists. Which algorithm matches those conditions and what is its complexity?$prompt$,
    $explanation$Bellman-Ford is the single-source algorithm for graphs that may have negative edges, and it can detect a reachable negative cycle by checking for a relaxation after V-1 passes. Its time complexity is O(V*E). BFS ignores weights, Dijkstra requires nonnegative edges, and Floyd-Warshall is all-pairs O(V^3).$explanation$,
    'advanced',
    2,
    4836,
    true
  ),
  (
    'dsa.graphs.shortest_path_algorithms.code_floyd_trace',
    'code_reading',
    'Trace one Floyd-Warshall update',
    $prompt$In Floyd-Warshall, `dist[i][j]` is improved by allowing each vertex k as an intermediate. Suppose `dist[A][C] = 10`, `dist[A][B] = 4`, and `dist[B][C] = 3` before the k = B pass. What should happen to `dist[A][C]`, and when is Floyd-Warshall a good fit?$prompt$,
    $explanation$The update checks dist[A][B] + dist[B][C] = 4 + 3 = 7, which improves dist[A][C] from 10 to 7. Floyd-Warshall is a good fit for small all-pairs shortest-path problems, including negative edges but not negative cycles; it costs O(V^3) time and O(V^2) space.$explanation$,
    'advanced',
    3,
    4838,
    true
  ),
  (
    'dsa.graphs.mst.code_kruskal_trace',
    'code_reading',
    'Trace Kruskal edge choices',
    $prompt$Diagram:

```text
A --2-- B --1-- C
 \      |       
  5     2       
   \    |       
      D --1-- C
```

Text equivalent: Undirected weighted graph: A-B has weight 2, A-D has weight 5, B-D has weight 2, B-C has weight 1, and D-C has weight 1.

Run Kruskal by considering edges in increasing weight order. Which edges are accepted, and what total MST weight results?$prompt$,
    $explanation$The cheapest edges are B-C (1) and C-D (1), both accepted. Next A-B (2) connects A to the existing component and is accepted; B-D (2) would now form a cycle and is skipped. A-D (5) is skipped too. The MST edges are B-C, C-D, and A-B with total weight 4.$explanation$,
    'advanced',
    3,
    4840,
    true
  ),
  (
    'dsa.graphs.bipartite_scc.code_color_trace',
    'code_reading',
    'Trace bipartite coloring',
    $prompt$An undirected graph has edges A-B, B-C, C-A, and C-D. Start BFS coloring with A = red and alternate colors across each edge. What conflict proves the graph is not bipartite?$prompt$,
    $explanation$A is red, so B and C must be blue. But B-C is also an edge, so it connects two blue vertices. That same-color edge reveals an odd cycle A-B-C-A, proving the graph is not bipartite. The check is O(V+E).$explanation$,
    'advanced',
    3,
    4842,
    true
  ),
  (
    'dsa.graphs.connectivity_patterns.lesson',
    'lesson',
    'Offline connectivity and graph cuts',
    $prompt$Some connectivity problems are easier when you change the time direction. A disjoint-set union supports edge additions, not deletions. If a problem gives all queries ahead of time and asks about connectivity while edges are deleted, process the operations in reverse: start from the graph after all deletions, answer queries backward, and turn each reversed deletion into a DSU union. This is an OFFLINE pattern because it needs the full query list first; each union/find is near-constant amortized after sorting or setup. Separate from DSU, bridges and articulation points identify fragile parts of an undirected graph: a bridge is an edge whose removal increases component count, and an articulation point is a vertex whose removal does the same. DFS low-link algorithms find them in O(V+E). Use offline DSU for batched dynamic connectivity with deletions, and bridges/articulation points when you need to know which single edge or vertex disconnects the graph.$prompt$,
    $explanation$DSU handles additions, so offline deletion queries can be reversed into additions. Bridges and articulation points are cut edges/vertices found by DFS low-link in O(V+E).$explanation$,
    'advanced',
    5,
    4844,
    true
  ),
  (
    'dsa.graphs.connectivity_patterns.mc_offline_deletions',
    'multiple_choice',
    'Offline connectivity with deletions',
    $prompt$You know the whole list of operations: delete edge, ask whether u and v are connected, delete edge, ask again. Which approach lets DSU answer the connectivity queries efficiently?$prompt$,
    $explanation$Process the operations in reverse. Start from the graph after all deletions, answer queries while walking backward, and when a deleted edge is encountered in reverse, add it back with union. DSU is good at additions; the offline reverse pass turns deletions into additions.$explanation$,
    'advanced',
    2,
    4846,
    true
  )
on conflict (id) do update
set
  type = excluded.type,
  title = excluded.title,
  prompt = excluded.prompt,
  explanation = excluded.explanation,
  difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes,
  order_index = excluded.order_index,
  is_active = true,
  updated_at = now();

insert into public.learning_item_skills (learning_item_id, skill_id, is_primary)
values
  ('dsa.graphs.connected_components.code_grid_trace', 'dsa.graphs.connected_components', true),
  ('dsa.graphs.bfs.code_parent_trace', 'dsa.graphs.bfs', true),
  ('dsa.graphs.shortest_path_algorithms.mc_select_conditions', 'dsa.graphs.shortest_path_algorithms', true),
  ('dsa.graphs.shortest_path_algorithms.code_floyd_trace', 'dsa.graphs.shortest_path_algorithms', true),
  ('dsa.graphs.mst.code_kruskal_trace', 'dsa.graphs.mst', true),
  ('dsa.graphs.bipartite_scc.code_color_trace', 'dsa.graphs.bipartite_scc', true),
  ('dsa.graphs.connectivity_patterns.lesson', 'dsa.graphs.connectivity_patterns', true),
  ('dsa.graphs.connectivity_patterns.mc_offline_deletions', 'dsa.graphs.connectivity_patterns', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.graphs.shortest_path_algorithms.mc_select_conditions.a', 'dsa.graphs.shortest_path_algorithms.mc_select_conditions', 'Bellman-Ford, O(V*E)', true, 10),
  ('dsa.graphs.shortest_path_algorithms.mc_select_conditions.b', 'dsa.graphs.shortest_path_algorithms.mc_select_conditions', 'Dijkstra, O((V+E) log V)', false, 20),
  ('dsa.graphs.shortest_path_algorithms.mc_select_conditions.c', 'dsa.graphs.shortest_path_algorithms.mc_select_conditions', 'BFS, O(V+E)', false, 30),
  ('dsa.graphs.shortest_path_algorithms.mc_select_conditions.d', 'dsa.graphs.shortest_path_algorithms.mc_select_conditions', 'Floyd-Warshall, O(V^3), as the best single-source choice', false, 40),
  ('dsa.graphs.connectivity_patterns.mc_offline_deletions.a', 'dsa.graphs.connectivity_patterns.mc_offline_deletions', 'Process queries in reverse so deletions become DSU unions', true, 10),
  ('dsa.graphs.connectivity_patterns.mc_offline_deletions.b', 'dsa.graphs.connectivity_patterns.mc_offline_deletions', 'Run Dijkstra after every deletion', false, 20),
  ('dsa.graphs.connectivity_patterns.mc_offline_deletions.c', 'dsa.graphs.connectivity_patterns.mc_offline_deletions', 'Use Floyd-Warshall because all queries are offline', false, 30),
  ('dsa.graphs.connectivity_patterns.mc_offline_deletions.d', 'dsa.graphs.connectivity_patterns.mc_offline_deletions', 'Sort vertices by degree and answer from degrees alone', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
