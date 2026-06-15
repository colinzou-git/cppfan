-- Roadmap #75 / #115 (graphs depth): choosing a shortest-path algorithm, minimum
-- spanning trees, and bipartite coloring / strongly connected components.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.graphs.shortest_path_algorithms',
    'dsa',
    'dsa.graphs',
    'Choosing a shortest-path algorithm',
    'Pick BFS, Dijkstra, Bellman-Ford, or Floyd-Warshall by weights, signs, and pairs.',
    'Select the right shortest-path algorithm from graph weights and the source/all-pairs need.',
    'advanced',
    array['lesson', 'quiz'],
    1780
  ),
  (
    'dsa.graphs.mst',
    'dsa',
    'dsa.graphs',
    'Minimum spanning trees',
    'Build an MST with Kruskal (union-find) or Prim, justified by the cut property.',
    'Construct an MST with Kruskal or Prim and explain why the cut property makes the greedy safe.',
    'advanced',
    array['lesson', 'quiz'],
    1790
  ),
  (
    'dsa.graphs.bipartite_scc',
    'dsa',
    'dsa.graphs',
    'Bipartite coloring and strongly connected components',
    '2-color a graph to test bipartiteness and find SCCs in directed graphs.',
    'Test bipartiteness by 2-coloring and recognize what an SCC is and how it is found.',
    'advanced',
    array['lesson', 'quiz'],
    1800
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
  ('dsa.graphs.shortest_path_algorithms', 'dsa.graphs.shortest_path', 'recommended'),
  ('dsa.graphs.mst', 'dsa.graphs.representation', 'recommended'),
  ('dsa.graphs.bipartite_scc', 'dsa.graphs.dfs', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
