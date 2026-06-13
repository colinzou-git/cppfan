-- DSA practice map expansion (#48): two-pointers/sliding-window and recursion.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.arrays.two_pointers',
    'dsa',
    'dsa.arrays',
    'Two pointers and sliding window',
    'Use two indices to solve pair and window problems in linear time.',
    'Replace an O(n^2) double loop with a linear two-pointer or sliding-window scan.',
    'intermediate',
    array['lesson', 'quiz', 'code_reading'],
    1030
  ),
  (
    'dsa.recursion.base_case',
    'dsa',
    'dsa.recursion',
    'Recursion and base cases',
    'Write a recursive function with a base case and a step toward it.',
    'Identify the base case and the recursive step, and avoid infinite recursion.',
    'intermediate',
    array['lesson', 'quiz', 'bug_spotting'],
    1510
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
  ('dsa.arrays.two_pointers', 'dsa.arrays.traversal', 'recommended'),
  ('dsa.recursion.base_case', 'cpp.structs_classes.syntax', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
