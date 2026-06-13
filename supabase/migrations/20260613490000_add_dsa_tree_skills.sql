-- Roadmap #65 / #74 (stage 7): trees, heaps, and disjoint-set (union-find).
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.trees.traversal',
    'dsa',
    'dsa.trees',
    'Binary tree traversal',
    'Visit tree nodes in preorder, inorder, postorder, or level order.',
    'Choose the traversal that fits a task and know inorder sorts a BST.',
    'intermediate',
    array['lesson', 'quiz'],
    1610
  ),
  (
    'dsa.trees.heap',
    'dsa',
    'dsa.trees',
    'Heaps and priority queues',
    'Use a binary heap for O(1) min/max access and O(log n) updates.',
    'Recognize when a heap (priority_queue) is the right tool.',
    'intermediate',
    array['lesson', 'quiz'],
    1620
  ),
  (
    'dsa.trees.disjoint_set',
    'dsa',
    'dsa.trees',
    'Disjoint set (union-find)',
    'Track grouped elements with near-constant find and union.',
    'Use union-find for connected components and cycle detection.',
    'advanced',
    array['lesson', 'quiz'],
    1630
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
  ('dsa.trees.traversal', 'dsa.recursion.base_case', 'recommended'),
  ('dsa.trees.heap', 'cpp.stl.adapters', 'recommended'),
  ('dsa.trees.disjoint_set', 'dsa.trees.traversal', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
