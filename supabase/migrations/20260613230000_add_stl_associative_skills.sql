-- STL module expansion (#46): associative containers map and set.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.stl.map',
    'cpp',
    'cpp.stl',
    'std::map and unordered_map',
    'Store key-value pairs with unique keys; choose ordered vs hashed lookup.',
    'Insert, look up, and check keys without accidentally inserting via operator[].',
    'intermediate',
    array['lesson', 'quiz', 'bug_spotting'],
    430
  ),
  (
    'cpp.stl.set',
    'cpp',
    'cpp.stl',
    'std::set and unordered_set',
    'Store unique elements and test membership efficiently.',
    'Use a set to deduplicate and to check membership.',
    'intermediate',
    array['lesson', 'quiz', 'code_reading'],
    440
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
  ('cpp.stl.map', 'cpp.stl.vector', 'recommended'),
  ('cpp.stl.set', 'cpp.stl.map', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
