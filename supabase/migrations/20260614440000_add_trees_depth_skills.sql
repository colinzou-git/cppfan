-- Roadmap #74 / #114 (trees depth): iterative + level-order traversal, tree
-- reconstruction from traversals, and tree diameter via height-tracking DFS.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.trees.traversal_techniques',
    'dsa',
    'dsa.trees',
    'Iterative and level-order traversal',
    'Make DFS iterative with an explicit stack and traverse level by level with a queue.',
    'Convert a recursive traversal to an explicit stack and do a level-order (BFS) traversal with a queue.',
    'advanced',
    array['lesson', 'quiz'],
    1640
  ),
  (
    'dsa.trees.traversal_reconstruction',
    'dsa',
    'dsa.trees',
    'Reconstructing a tree from traversals',
    'Rebuild a unique binary tree from inorder plus preorder or postorder.',
    'Reconstruct a tree from inorder + preorder/postorder and explain why preorder + postorder is ambiguous.',
    'advanced',
    array['lesson', 'quiz'],
    1645
  ),
  (
    'dsa.trees.tree_diameter',
    'dsa',
    'dsa.trees',
    'Tree diameter and height-tracking DFS',
    'Find the longest path with one post-order DFS that returns height and tracks a global best.',
    'Compute a tree diameter in O(n) by returning height upward while updating a global best.',
    'advanced',
    array['lesson', 'quiz'],
    1650
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
  ('dsa.trees.traversal_techniques', 'dsa.trees.traversal', 'recommended'),
  ('dsa.trees.traversal_reconstruction', 'dsa.trees.traversal', 'recommended'),
  ('dsa.trees.tree_diameter', 'dsa.trees.traversal', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
