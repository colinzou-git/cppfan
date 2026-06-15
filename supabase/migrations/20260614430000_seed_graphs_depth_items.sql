-- Roadmap #75 / #115 (graphs depth): learning items for shortest-path algorithm
-- selection, minimum spanning trees, and bipartite coloring / SCCs.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.graphs.shortest_path_algorithms.lesson',
    'lesson',
    'Choosing a shortest-path algorithm',
    'Picking the right shortest-path algorithm depends on the graph. Unweighted (or all edges equal): plain BFS finds shortest paths in O(V+E) — the first time BFS reaches a node is via a fewest-edges path. Non-negative weights: Dijkstra with a priority queue, O((V+E) log V); it greedily settles the closest unsettled node, which is only valid when no edge is negative. Negative edge weights: Bellman-Ford, O(V*E); it relaxes all edges V-1 times and can also DETECT a negative cycle (if an edge still relaxes on the V-th pass, a negative cycle is reachable). All-pairs shortest paths on a small dense graph: Floyd-Warshall, O(V^3), a three-loop DP over intermediate vertices. The decision: no weights then BFS; non-negative then Dijkstra; possible negatives or need cycle detection then Bellman-Ford; every pair on a small graph then Floyd-Warshall. A classic bug is running Dijkstra on a graph with negative edges — it can settle a node too early and report a wrong distance.',
    'BFS for unweighted (O(V+E)); Dijkstra for non-negative weights (O((V+E) log V), greedy — invalid with negative edges); Bellman-Ford for negative edges and negative-cycle detection (O(V*E)); Floyd-Warshall for all-pairs on small graphs (O(V^3)). Running Dijkstra with negative edges is a classic bug.',
    'advanced',
    6,
    4710,
    true
  ),
  (
    'dsa.graphs.shortest_path_algorithms.mc_negative',
    'multiple_choice',
    'Shortest paths with negative edges',
    'A weighted directed graph has some NEGATIVE edge weights and you need single-source shortest paths plus detection of a negative cycle. Which algorithm fits?',
    'Bellman-Ford handles negative edge weights and detects a negative cycle (an edge that still relaxes after V-1 passes). Dijkstra assumes non-negative weights; BFS ignores weights.',
    'advanced',
    2,
    4720,
    true
  ),
  (
    'dsa.graphs.mst.lesson',
    'lesson',
    'Minimum spanning trees',
    'A minimum spanning tree (MST) connects all vertices of a weighted, connected, undirected graph with the smallest total edge weight and no cycles (V-1 edges). Two greedy algorithms build it. Kruskal: sort all edges by weight ascending, then add each edge whose endpoints are in different components, using a disjoint-set union (union-find) to test and merge components; skip an edge that would form a cycle. O(E log E), dominated by the sort. Prim: grow one tree from a start vertex, repeatedly adding the cheapest edge that leaves the current tree (a priority queue gives O((V+E) log V)), like Dijkstra but keyed on edge weight rather than path distance. Both are justified by the cut property: for any cut of the graph, the minimum-weight edge crossing it is safe to include in some MST. Kruskal suits sparse graphs and edge lists; Prim suits dense graphs and adjacency structures. The MST is not generally unique when weights tie.',
    'An MST connects all vertices with minimum total weight and no cycle (V-1 edges). Kruskal: sort edges, add the cheapest that joins two different components (union-find), O(E log E). Prim: grow from a vertex, add the cheapest crossing edge (priority queue). Both follow the cut property: the minimum edge across any cut is safe.',
    'advanced',
    6,
    4730,
    true
  ),
  (
    'dsa.graphs.mst.mc_cycle',
    'multiple_choice',
    'Cycle test in Kruskal',
    'In Kruskal MST construction, what decides whether adding the next-cheapest edge would form a cycle?',
    'A disjoint-set union (union-find): if the edge joins two vertices already in the same set it would create a cycle, so it is skipped; otherwise the two sets are merged. Sorting only orders the edges.',
    'advanced',
    2,
    4740,
    true
  ),
  (
    'dsa.graphs.bipartite_scc.lesson',
    'lesson',
    'Bipartite coloring and strongly connected components',
    'Two connectivity properties come up often. Bipartite check: a graph is bipartite if you can 2-color it so every edge joins different colors — equivalently, it has no odd-length cycle. Test it with BFS or DFS: color the start, give each neighbor the opposite color, and if you ever find an edge between same-colored nodes the graph is not bipartite. O(V+E). Bipartite graphs model matching and scheduling (two disjoint sides). Strongly connected components (SCC) apply to DIRECTED graphs: an SCC is a maximal set of vertices where every vertex can reach every other. Condensing each SCC to a single node turns any directed graph into a DAG, useful for ordering. Linear-time SCC algorithms — Kosaraju (two DFS passes, the second on the reversed graph) and Tarjan (one DFS tracking discovery and low-link values) — both run in O(V+E). Use bipartite coloring for two-sided or odd-cycle questions on undirected graphs, and SCCs to find mutually-reachable groups and build the DAG of components in a directed graph.',
    'A graph is bipartite iff it 2-colors with no same-color edge (no odd cycle); check by BFS/DFS coloring in O(V+E). An SCC (directed graphs) is a maximal mutually-reachable vertex set; Kosaraju (two DFS, one on the reversed graph) and Tarjan (one DFS with low-link) find all SCCs in O(V+E), and condensing SCCs yields a DAG.',
    'advanced',
    6,
    4750,
    true
  ),
  (
    'dsa.graphs.bipartite_scc.mc_test',
    'multiple_choice',
    'Testing bipartiteness',
    'How can you test whether an undirected graph is bipartite?',
    'Try a 2-coloring with BFS/DFS: color each node opposite its parent; if any edge connects two same-colored nodes it is not bipartite (equivalently, it has an odd cycle). O(V+E).',
    'advanced',
    2,
    4760,
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
  ('dsa.graphs.shortest_path_algorithms.lesson', 'dsa.graphs.shortest_path_algorithms', true),
  ('dsa.graphs.shortest_path_algorithms.mc_negative', 'dsa.graphs.shortest_path_algorithms', true),
  ('dsa.graphs.mst.lesson', 'dsa.graphs.mst', true),
  ('dsa.graphs.mst.mc_cycle', 'dsa.graphs.mst', true),
  ('dsa.graphs.bipartite_scc.lesson', 'dsa.graphs.bipartite_scc', true),
  ('dsa.graphs.bipartite_scc.mc_test', 'dsa.graphs.bipartite_scc', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.graphs.shortest_path_algorithms.mc_negative.a', 'dsa.graphs.shortest_path_algorithms.mc_negative', 'Bellman-Ford', true, 10),
  ('dsa.graphs.shortest_path_algorithms.mc_negative.b', 'dsa.graphs.shortest_path_algorithms.mc_negative', 'Dijkstra', false, 20),
  ('dsa.graphs.shortest_path_algorithms.mc_negative.c', 'dsa.graphs.shortest_path_algorithms.mc_negative', 'Breadth-first search', false, 30),
  ('dsa.graphs.shortest_path_algorithms.mc_negative.d', 'dsa.graphs.shortest_path_algorithms.mc_negative', 'Binary search', false, 40),
  ('dsa.graphs.mst.mc_cycle.a', 'dsa.graphs.mst.mc_cycle', 'A disjoint-set union (union-find) over the vertices', true, 10),
  ('dsa.graphs.mst.mc_cycle.b', 'dsa.graphs.mst.mc_cycle', 'A min-heap of vertices', false, 20),
  ('dsa.graphs.mst.mc_cycle.c', 'dsa.graphs.mst.mc_cycle', 'A stack of visited edges', false, 30),
  ('dsa.graphs.mst.mc_cycle.d', 'dsa.graphs.mst.mc_cycle', 'A 2-D distance matrix', false, 40),
  ('dsa.graphs.bipartite_scc.mc_test.a', 'dsa.graphs.bipartite_scc.mc_test', '2-color it with BFS/DFS; fail if an edge joins two same-colored nodes', true, 10),
  ('dsa.graphs.bipartite_scc.mc_test.b', 'dsa.graphs.bipartite_scc.mc_test', 'Check that it has no cycles at all', false, 20),
  ('dsa.graphs.bipartite_scc.mc_test.c', 'dsa.graphs.bipartite_scc.mc_test', 'Run Dijkstra from every node', false, 30),
  ('dsa.graphs.bipartite_scc.mc_test.d', 'dsa.graphs.bipartite_scc.mc_test', 'Count whether it has an even number of vertices', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
