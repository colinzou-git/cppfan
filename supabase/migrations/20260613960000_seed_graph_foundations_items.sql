-- Roadmap #75 / #115 (graph foundations): learning items for connected
-- components, cycle detection, and topological sort / DAGs.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'dsa.graphs.connected_components.lesson',
    'lesson',
    'Connected components',
    'A connected component is a maximal set of vertices reachable from one another. To label all components, keep a visited array and loop over every vertex: each time you find an unvisited one, run a BFS or DFS from it, marking everything it reaches as the next component id. That is O(V + E) total because each vertex and edge is touched once. A grid is an implicit graph — treat each cell as a vertex with edges to its 4 (or 8) neighbors — so counting islands, flood fill, and region problems are just connected-components in disguise; you do not build an explicit adjacency list, you compute neighbors from (row, col). The count of BFS/DFS launches is the number of components.',
    'Components = maximal mutually-reachable vertex sets. Loop all vertices; from each unvisited one run BFS/DFS marking its component — O(V + E). A grid is an implicit graph (cells = vertices, neighbors = edges), so island/flood-fill is connected-components.',
    'intermediate',
    5,
    3750,
    true
  ),
  (
    'dsa.graphs.connected_components.mc_count',
    'multiple_choice',
    'Counting components',
    'How do you count the connected components of a graph with BFS/DFS?',
    'Loop over all vertices; each time you start a BFS/DFS from an unvisited vertex you have found a new component, so the number of launches equals the component count.',
    'intermediate',
    2,
    3760,
    true
  ),
  (
    'dsa.graphs.cycle_detection.lesson',
    'lesson',
    'Cycle detection',
    'Detecting a cycle depends on whether the graph is directed. In a directed graph, run DFS with three colors: white (unvisited), gray (on the current recursion stack), black (finished). If DFS reaches a gray node, you found a back edge — a cycle. (A directed graph with no cycle is a DAG, which is exactly what makes topological sort possible.) In an undirected graph, a cycle shows up during DFS as an edge to an already-visited vertex that is not the immediate parent; equivalently, process edges with union-find and a cycle exists the moment an edge connects two vertices already in the same set. Watch the undirected subtlety: the edge back to your parent is not a cycle, so track and skip the parent.',
    'Directed: DFS 3-color — an edge to a gray (on-stack) node is a back edge = cycle (no cycle => DAG). Undirected: an edge to a visited non-parent vertex, or a union-find edge within one set, signals a cycle.',
    'advanced',
    5,
    3770,
    true
  ),
  (
    'dsa.graphs.cycle_detection.mc_directed',
    'multiple_choice',
    'Cycle in a directed graph',
    'Using DFS with white/gray/black coloring on a directed graph, which edge indicates a cycle?',
    'An edge to a gray vertex — one still on the current recursion stack — is a back edge and proves a cycle. Edges to black (finished) vertices are cross/forward edges and do not.',
    'advanced',
    2,
    3780,
    true
  ),
  (
    'dsa.graphs.topological_sort.lesson',
    'lesson',
    'Topological sort and DAGs',
    'A topological sort linearly orders the vertices of a directed acyclic graph (DAG) so that for every edge u->v, u comes before v — exactly what you need to schedule tasks with dependencies, order build targets, or resolve prerequisites. Two standard methods: Kahn algorithm repeatedly removes a vertex with in-degree 0 and decrements its neighbors in-degrees (BFS-style), and DFS pushes each vertex onto a stack as it finishes, then reverses it. Both run in O(V + E). A topological order exists iff the graph is acyclic: if a cycle is present, no valid ordering exists — Kahn leaves vertices with nonzero in-degree, and DFS finds a back edge. So topological sort and directed-cycle detection are two sides of the same coin.',
    'A topological sort orders a DAG so every edge points forward (Kahn in-degree BFS, or reverse DFS-finish order), in O(V + E). It exists iff the graph is acyclic; a cycle makes it impossible.',
    'advanced',
    5,
    3790,
    true
  ),
  (
    'dsa.graphs.topological_sort.mc_exists',
    'multiple_choice',
    'When a topological order exists',
    'A directed graph has a valid topological ordering exactly when it is...?',
    '...acyclic (a DAG). If the graph contains a directed cycle, the mutual dependency makes any linear ordering impossible, so no topological sort exists.',
    'advanced',
    2,
    3800,
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
  ('dsa.graphs.connected_components.lesson', 'dsa.graphs.connected_components', true),
  ('dsa.graphs.connected_components.mc_count', 'dsa.graphs.connected_components', true),
  ('dsa.graphs.cycle_detection.lesson', 'dsa.graphs.cycle_detection', true),
  ('dsa.graphs.cycle_detection.mc_directed', 'dsa.graphs.cycle_detection', true),
  ('dsa.graphs.topological_sort.lesson', 'dsa.graphs.topological_sort', true),
  ('dsa.graphs.topological_sort.mc_exists', 'dsa.graphs.topological_sort', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('dsa.graphs.connected_components.mc_count.a', 'dsa.graphs.connected_components.mc_count', 'Count how many times you start a BFS/DFS from an unvisited vertex', true, 10),
  ('dsa.graphs.connected_components.mc_count.b', 'dsa.graphs.connected_components.mc_count', 'Count the total number of edges', false, 20),
  ('dsa.graphs.connected_components.mc_count.c', 'dsa.graphs.connected_components.mc_count', 'Count the vertices with degree 0', false, 30),
  ('dsa.graphs.connected_components.mc_count.d', 'dsa.graphs.connected_components.mc_count', 'Run Dijkstra from vertex 0', false, 40),
  ('dsa.graphs.cycle_detection.mc_directed.a', 'dsa.graphs.cycle_detection.mc_directed', 'An edge to a gray vertex (still on the recursion stack)', true, 10),
  ('dsa.graphs.cycle_detection.mc_directed.b', 'dsa.graphs.cycle_detection.mc_directed', 'An edge to a black (finished) vertex', false, 20),
  ('dsa.graphs.cycle_detection.mc_directed.c', 'dsa.graphs.cycle_detection.mc_directed', 'An edge to a white (unvisited) vertex', false, 30),
  ('dsa.graphs.cycle_detection.mc_directed.d', 'dsa.graphs.cycle_detection.mc_directed', 'Any edge at all', false, 40),
  ('dsa.graphs.topological_sort.mc_exists.a', 'dsa.graphs.topological_sort.mc_exists', 'Acyclic (a DAG)', true, 10),
  ('dsa.graphs.topological_sort.mc_exists.b', 'dsa.graphs.topological_sort.mc_exists', 'Connected', false, 20),
  ('dsa.graphs.topological_sort.mc_exists.c', 'dsa.graphs.topological_sort.mc_exists', 'Undirected', false, 30),
  ('dsa.graphs.topological_sort.mc_exists.d', 'dsa.graphs.topological_sort.mc_exists', 'Weighted with nonnegative edges', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
