-- Roadmap #74 / #114 (trees depth): BST search, heap applications/selection,
-- and union-find internals.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.trees.bst_search',
    'dsa',
    'dsa.trees',
    'Binary search tree search',
    'Use the BST ordering invariant to search, insert, and reason about balance.',
    'Search a BST in O(h) by comparing and descending, and know why balance matters.',
    'intermediate',
    array['lesson', 'quiz'],
    1615
  ),
  (
    'dsa.trees.heap_applications',
    'dsa',
    'dsa.trees',
    'Heap applications and selection',
    'Apply a heap to top-k and scheduling, and choose it over a sorted vector or map.',
    'Use a priority_queue for top-k/scheduling and pick a heap when you repeatedly need the best.',
    'advanced',
    array['lesson', 'quiz'],
    1625
  ),
  (
    'dsa.trees.dsu_internals',
    'dsa',
    'dsa.trees',
    'Union-find internals',
    'Understand path compression and union by rank/size and their near-constant cost.',
    'Explain how path compression and union by rank give near-constant amortized operations.',
    'advanced',
    array['lesson', 'quiz'],
    1635
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
  ('dsa.trees.bst_search', 'dsa.trees.traversal', 'recommended'),
  ('dsa.trees.heap_applications', 'dsa.trees.heap', 'recommended'),
  ('dsa.trees.dsu_internals', 'dsa.trees.disjoint_set', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
