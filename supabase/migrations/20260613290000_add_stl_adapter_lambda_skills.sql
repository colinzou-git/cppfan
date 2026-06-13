-- STL module expansion (#46): container adapters and lambdas (final STL groups).
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.stl.adapters',
    'cpp',
    'cpp.stl',
    'Container adapters',
    'Use stack (LIFO), queue (FIFO), and priority_queue (highest priority first).',
    'Pick the right adapter for LIFO, FIFO, or priority access.',
    'intermediate',
    array['lesson', 'quiz', 'code_reading'],
    470
  ),
  (
    'cpp.stl.lambdas',
    'cpp',
    'cpp.stl',
    'Lambdas',
    'Write inline anonymous functions and capture surrounding variables.',
    'Pass a lambda to an algorithm and control what it captures.',
    'intermediate',
    array['lesson', 'quiz', 'code_reading'],
    480
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
  ('cpp.stl.adapters', 'cpp.stl.vector', 'recommended'),
  ('cpp.stl.lambdas', 'cpp.stl.algorithms', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
