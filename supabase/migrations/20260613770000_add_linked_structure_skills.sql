-- Roadmap #74 / #114 (trees follow-up): singly linked lists, list-vs-vector
-- tradeoffs, and tree terminology.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.trees.linked_list',
    'dsa',
    'dsa.trees',
    'Singly linked lists',
    'Model nodes that point to the next, and traverse/insert/delete safely.',
    'Traverse a singly linked list and insert/delete a node without leaking or dangling.',
    'intermediate',
    array['lesson', 'quiz'],
    1600
  ),
  (
    'dsa.trees.list_vs_vector',
    'dsa',
    'dsa.trees',
    'List vs vector tradeoffs',
    'Weigh memory locality against mid-sequence insertion when choosing a container.',
    'Explain why std::vector is the default and when a linked list actually helps.',
    'intermediate',
    array['lesson', 'quiz'],
    1601
  ),
  (
    'dsa.trees.tree_terminology',
    'dsa',
    'dsa.trees',
    'Tree terminology and shape',
    'Name parts of a tree and reason about its recursive structure, height, and depth.',
    'Use root/leaf/subtree/height/depth correctly and see a tree as a recursive structure.',
    'intermediate',
    array['lesson', 'quiz'],
    1605
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
  ('dsa.trees.linked_list', 'cpp.references.pointers', 'recommended'),
  ('dsa.trees.list_vs_vector', 'dsa.trees.linked_list', 'recommended'),
  ('dsa.trees.tree_terminology', 'dsa.recursion.base_case', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
