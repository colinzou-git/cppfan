-- Roadmap #80 / #121 (utilities depth): robust stream input, pairs/tuples and
-- structured bindings, and scoped enums for finite states.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.utilities.stream_validation',
    'cpp',
    'cpp.utilities',
    'Robust stream input',
    'Check stream state and recover from invalid input instead of trusting extraction.',
    'Detect a failed extraction, then clear() and ignore() to recover and revalidate input.',
    'intermediate',
    array['lesson', 'quiz'],
    764
  ),
  (
    'cpp.utilities.tuples',
    'cpp',
    'cpp.utilities',
    'Pairs, tuples, and structured bindings',
    'Group a few related values with std::pair/std::tuple and unpack them by name.',
    'Return a std::pair/std::tuple and destructure it with structured bindings.',
    'intermediate',
    array['lesson', 'quiz'],
    765
  ),
  (
    'cpp.utilities.enums',
    'cpp',
    'cpp.utilities',
    'Scoped enums for finite states',
    'Model a fixed set of states with enum class and know when to reach for variant instead.',
    'Use enum class for a closed set of named states and pick enum vs variant appropriately.',
    'intermediate',
    array['lesson', 'quiz'],
    766
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
  ('cpp.utilities.stream_validation', 'cpp.utilities.file_io', 'recommended'),
  ('cpp.utilities.tuples', 'cpp.functions.basics', 'recommended'),
  ('cpp.utilities.enums', 'cpp.utilities.variant', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
