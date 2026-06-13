-- First slice of the STL module (#46): sequence containers vector and string.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.stl.vector',
    'cpp',
    'cpp.stl',
    'std::vector',
    'Use a resizable array that owns and manages its elements.',
    'Add, access, and size a vector, and access elements safely with at().',
    'intermediate',
    array['lesson', 'quiz', 'code_reading'],
    410
  ),
  (
    'cpp.stl.string',
    'cpp',
    'cpp.stl',
    'std::string',
    'Use a growable character sequence that manages its own memory.',
    'Build, size, index, and search strings without manual memory management.',
    'intermediate',
    array['lesson', 'quiz', 'code_reading'],
    420
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
  ('cpp.stl.vector', 'cpp.structs_classes.syntax', 'recommended'),
  ('cpp.stl.string', 'cpp.stl.vector', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
