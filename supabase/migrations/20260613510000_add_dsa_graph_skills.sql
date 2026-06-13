-- Roadmap #65 / #75 (stage 8): graph representation, traversal, and shortest paths.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.graphs.representation',
    'dsa',
    'dsa.graphs',
    'Graph representation',
    'Model graphs with adjacency lists or adjacency matrices.',
    'Choose an adjacency list or matrix based on density and the operations needed.',
    'intermediate',
    array['lesson', 'quiz'],
    1710
  ),
  (
    'dsa.graphs.bfs',
    'dsa',
    'dsa.graphs',
    'Breadth-first search',
    'Explore a graph level by level with a queue.',
    'Use BFS to find shortest paths in an unweighted graph.',
    'intermediate',
    array['lesson', 'quiz'],
    1720
  ),
  (
    'dsa.graphs.dfs',
    'dsa',
    'dsa.graphs',
    'Depth-first search',
    'Explore as deep as possible before backtracking, using recursion or a stack.',
    'Use DFS for reachability, cycle detection, and topological ordering.',
    'intermediate',
    array['lesson', 'quiz'],
    1730
  ),
  (
    'dsa.graphs.shortest_path',
    'dsa',
    'dsa.graphs',
    'Shortest paths',
    'Find minimum-cost paths with BFS, Dijkstra, or Bellman-Ford.',
    'Pick the right shortest-path algorithm for weighted vs unweighted graphs.',
    'advanced',
    array['lesson', 'quiz'],
    1740
  )
on conflict (id) do update
set
  domain = excluded.domain,
  module_id = excluded.module_id,
  title = excluded.title,
  description = excluded.description,
  learner_goal = excluded.learner_goal,
  level = excluded.level,
  item_types = excluded.item_types,
  order_index = excluded.order_index,
  is_active = true,
  updated_at = now();

insert into public.skill_prerequisites (skill_id, prerequisite_skill_id, relationship_type)
values
  ('dsa.graphs.representation', 'cpp.stl.vector', 'recommended'),
  ('dsa.graphs.bfs', 'dsa.graphs.representation', 'recommended'),
  ('dsa.graphs.dfs', 'dsa.graphs.representation', 'recommended'),
  ('dsa.graphs.shortest_path', 'dsa.graphs.bfs', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
