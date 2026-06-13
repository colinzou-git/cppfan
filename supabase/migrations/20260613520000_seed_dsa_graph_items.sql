-- Roadmap #65 / #75 (stage 8): learning items for graph representation, traversal, shortest paths.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.graphs.representation.lesson',
    'lesson',
    'Graph representation',
    'A graph is a set of vertices connected by edges. Two common representations trade space for speed. An adjacency list stores, for each vertex, a list of its neighbors — compact at O(V + E) space and ideal for sparse graphs and iterating a vertex''s neighbors. An adjacency matrix is a V-by-V grid where cell [i][j] marks an edge from i to j — it uses O(V^2) space but answers "is there an edge between i and j?" in O(1), which suits dense graphs. Most competitive and interview graph code uses adjacency lists (for example vector<vector<int>>).',
    'Adjacency lists cost O(V + E) and favor sparse graphs and neighbor iteration; adjacency matrices cost O(V^2) but give O(1) edge lookup, favoring dense graphs.',
    'intermediate',
    5,
    2110,
    true
  ),
  (
    'dsa.graphs.representation.mc_sparse',
    'multiple_choice',
    'Choosing a representation',
    'Which representation uses the least memory for a large, sparse graph (few edges per vertex)?',
    'An adjacency list stores only the edges that exist, so it uses O(V + E) space. For a sparse graph E is small, making the list far more memory-efficient than an O(V^2) adjacency matrix.',
    'intermediate',
    2,
    2120,
    true
  ),
  (
    'dsa.graphs.bfs.lesson',
    'lesson',
    'Breadth-first search',
    'Breadth-first search explores a graph in expanding rings: it visits the start vertex, then all neighbors at distance 1, then distance 2, and so on. It uses a FIFO queue and a visited set to avoid revisiting nodes. Because BFS reaches nodes in nondecreasing distance order, it finds the shortest path (fewest edges) in an unweighted graph. The whole traversal runs in O(V + E) time with an adjacency list.',
    'BFS visits vertices in order of distance from the start using a queue, so it finds shortest paths by edge count in unweighted graphs in O(V + E).',
    'intermediate',
    5,
    2130,
    true
  ),
  (
    'dsa.graphs.bfs.mc_shortest',
    'multiple_choice',
    'What BFS finds',
    'In an unweighted graph, what does BFS from a source vertex give you?',
    'BFS expands by distance, so the first time it reaches a vertex is along a path with the fewest edges — the shortest path in an unweighted graph.',
    'intermediate',
    2,
    2140,
    true
  ),
  (
    'dsa.graphs.dfs.lesson',
    'lesson',
    'Depth-first search',
    'Depth-first search follows one path as far as it can, then backtracks to the most recent vertex with unexplored neighbors. It is naturally written with recursion (the call stack does the bookkeeping) or with an explicit stack, plus a visited set. DFS runs in O(V + E) and underpins reachability, connected-component counting, cycle detection, and topological sorting of a DAG. Unlike BFS, DFS does not generally find shortest paths.',
    'DFS dives deep then backtracks (via recursion or a stack); it powers reachability, cycle detection, and topological sort, but does not find shortest paths in general.',
    'intermediate',
    5,
    2150,
    true
  ),
  (
    'dsa.graphs.dfs.mc_structure',
    'multiple_choice',
    'How DFS is implemented',
    'Which data structure naturally backs a depth-first search?',
    'DFS explores the most recently discovered vertex first, which is LIFO behavior — a stack. Recursion uses the call stack implicitly; an iterative DFS uses an explicit stack.',
    'intermediate',
    2,
    2160,
    true
  ),
  (
    'dsa.graphs.shortest_path.lesson',
    'lesson',
    'Shortest paths',
    'The right shortest-path algorithm depends on the edge weights. On an unweighted graph, plain BFS gives shortest paths in O(V + E). With non-negative weights, Dijkstra''s algorithm uses a min-priority queue to always expand the closest unsettled vertex, running in O((V + E) log V). When edges can be negative, Dijkstra breaks and Bellman-Ford applies, relaxing every edge V-1 times in O(V * E) and also detecting negative cycles. Matching the algorithm to the weight model is the key decision.',
    'Use BFS for unweighted graphs, Dijkstra for non-negative weights, and Bellman-Ford when negative edges are possible (it also detects negative cycles).',
    'advanced',
    6,
    2170,
    true
  ),
  (
    'dsa.graphs.shortest_path.mc_dijkstra',
    'multiple_choice',
    'When Dijkstra fails',
    'Why can Dijkstra''s algorithm give wrong answers when a graph has negative edge weights?',
    'Dijkstra finalizes a vertex''s distance once it is popped as the closest unsettled node, assuming no later path can be shorter. A negative edge can make a later path shorter, violating that assumption — so Bellman-Ford is used instead.',
    'advanced',
    2,
    2180,
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
  ('dsa.graphs.representation.lesson', 'dsa.graphs.representation', true),
  ('dsa.graphs.representation.mc_sparse', 'dsa.graphs.representation', true),
  ('dsa.graphs.bfs.lesson', 'dsa.graphs.bfs', true),
  ('dsa.graphs.bfs.mc_shortest', 'dsa.graphs.bfs', true),
  ('dsa.graphs.dfs.lesson', 'dsa.graphs.dfs', true),
  ('dsa.graphs.dfs.mc_structure', 'dsa.graphs.dfs', true),
  ('dsa.graphs.shortest_path.lesson', 'dsa.graphs.shortest_path', true),
  ('dsa.graphs.shortest_path.mc_dijkstra', 'dsa.graphs.shortest_path', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.graphs.representation.mc_sparse.a', 'dsa.graphs.representation.mc_sparse', 'An adjacency list', true, 10),
  ('dsa.graphs.representation.mc_sparse.b', 'dsa.graphs.representation.mc_sparse', 'An adjacency matrix', false, 20),
  ('dsa.graphs.representation.mc_sparse.c', 'dsa.graphs.representation.mc_sparse', 'A V-by-V boolean grid', false, 30),
  ('dsa.graphs.representation.mc_sparse.d', 'dsa.graphs.representation.mc_sparse', 'They use the same memory', false, 40),
  ('dsa.graphs.bfs.mc_shortest.a', 'dsa.graphs.bfs.mc_shortest', 'The shortest path by number of edges to every reachable vertex', true, 10),
  ('dsa.graphs.bfs.mc_shortest.b', 'dsa.graphs.bfs.mc_shortest', 'The minimum spanning tree', false, 20),
  ('dsa.graphs.bfs.mc_shortest.c', 'dsa.graphs.bfs.mc_shortest', 'A topological ordering', false, 30),
  ('dsa.graphs.bfs.mc_shortest.d', 'dsa.graphs.bfs.mc_shortest', 'The longest path in the graph', false, 40),
  ('dsa.graphs.dfs.mc_structure.a', 'dsa.graphs.dfs.mc_structure', 'A stack (often the recursion call stack)', true, 10),
  ('dsa.graphs.dfs.mc_structure.b', 'dsa.graphs.dfs.mc_structure', 'A FIFO queue', false, 20),
  ('dsa.graphs.dfs.mc_structure.c', 'dsa.graphs.dfs.mc_structure', 'A min-priority queue', false, 30),
  ('dsa.graphs.dfs.mc_structure.d', 'dsa.graphs.dfs.mc_structure', 'A hash map', false, 40),
  ('dsa.graphs.shortest_path.mc_dijkstra.a', 'dsa.graphs.shortest_path.mc_dijkstra', 'It finalizes a vertex''s distance once visited, which a negative edge can later undercut', true, 10),
  ('dsa.graphs.shortest_path.mc_dijkstra.b', 'dsa.graphs.shortest_path.mc_dijkstra', 'It cannot use a priority queue', false, 20),
  ('dsa.graphs.shortest_path.mc_dijkstra.c', 'dsa.graphs.shortest_path.mc_dijkstra', 'It only works on trees', false, 30),
  ('dsa.graphs.shortest_path.mc_dijkstra.d', 'dsa.graphs.shortest_path.mc_dijkstra', 'It requires the graph to be undirected', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
