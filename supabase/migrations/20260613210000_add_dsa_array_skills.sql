-- First slice of the DSA practice map (#48): the dsa.arrays module with indexing
-- and traversal. Introduces the dsa domain. Idempotent; mirrored in
-- src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.arrays.indexing',
    'dsa',
    'dsa.arrays',
    'Array indexing',
    'Access elements by zero-based index and avoid off-by-one and out-of-bounds errors.',
    'Identify the valid index range of a sequence and spot off-by-one mistakes.',
    'beginner',
    array['lesson', 'quiz', 'bug_spotting'],
    1010
  ),
  (
    'dsa.arrays.traversal',
    'dsa',
    'dsa.arrays',
    'Array traversal',
    'Iterate through arrays and vectors correctly, visiting each element once.',
    'Write a loop that visits every element exactly once without skipping or overrunning.',
    'beginner',
    array['lesson', 'quiz', 'code_reading'],
    1020
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
  ('dsa.arrays.indexing', 'cpp.stl.vector', 'recommended'),
  ('dsa.arrays.traversal', 'dsa.arrays.indexing', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
