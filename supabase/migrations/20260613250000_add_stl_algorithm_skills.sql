-- STL module expansion (#46): standard algorithms and iterators.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.stl.algorithms',
    'cpp',
    'cpp.stl',
    'Standard algorithms',
    'Use <algorithm> and <numeric> functions instead of hand-written loops.',
    'Reach for sort, find, count, accumulate, and min/max_element on iterator ranges.',
    'intermediate',
    array['lesson', 'quiz', 'code_reading'],
    450
  ),
  (
    'cpp.stl.iterators',
    'cpp',
    'cpp.stl',
    'Iterators and range-based for',
    'Understand begin/end ranges and iterate with range-based for loops.',
    'Explain the half-open [begin, end) range and iterate without manual index bookkeeping.',
    'intermediate',
    array['lesson', 'quiz', 'code_reading'],
    460
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
  ('cpp.stl.iterators', 'cpp.stl.vector', 'recommended'),
  ('cpp.stl.algorithms', 'cpp.stl.iterators', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
