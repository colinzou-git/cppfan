-- Roadmap #75 / #115 (graph foundations): connected components, cycle detection,
-- and topological sort / DAGs.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.graphs.connected_components',
    'dsa',
    'dsa.graphs',
    'Connected components',
    'Count and label connected components, including grid-as-graph problems.',
    'Find connected components with BFS/DFS and model a grid as an implicit graph.',
    'intermediate',
    array['lesson', 'quiz'],
    1750
  ),
  (
    'dsa.graphs.cycle_detection',
    'dsa',
    'dsa.graphs',
    'Cycle detection',
    'Detect cycles in directed and undirected graphs.',
    'Detect a cycle with DFS colors (directed) or union-find/parent checks (undirected).',
    'advanced',
    array['lesson', 'quiz'],
    1760
  ),
  (
    'dsa.graphs.topological_sort',
    'dsa',
    'dsa.graphs',
    'Topological sort and DAGs',
    'Order a DAG so every edge points forward; recognize when it exists.',
    'Produce a topological order of a DAG and know a cycle makes one impossible.',
    'advanced',
    array['lesson', 'quiz'],
    1770
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
  ('dsa.graphs.connected_components', 'dsa.graphs.dfs', 'recommended'),
  ('dsa.graphs.cycle_detection', 'dsa.graphs.dfs', 'recommended'),
  ('dsa.graphs.topological_sort', 'dsa.graphs.dfs', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
