-- Roadmap #69 / #111 (value-semantics follow-up): special-member selection,
-- copy elision / return-by-value, and operator overloading / conversions.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.value_semantics.special_members',
    'cpp',
    'cpp.value_semantics',
    'Which special member runs',
    'Tell apart copy/move construction and assignment, and control them with =default/=delete.',
    'Predict which special member a statement invokes and know moved-from objects are valid but unspecified.',
    'intermediate',
    array['lesson', 'quiz'],
    254
  ),
  (
    'cpp.value_semantics.copy_elision',
    'cpp',
    'cpp.value_semantics',
    'Copy elision and return by value',
    'Reason about why returning by value is cheap and when deep vs shallow copies matter.',
    'Explain copy elision so returning a local by value is efficient, not a costly copy.',
    'intermediate',
    array['lesson', 'quiz'],
    255
  ),
  (
    'cpp.value_semantics.operators',
    'cpp',
    'cpp.value_semantics',
    'Operator overloading and conversions',
    'Design equality/ordering and conversions that behave the way callers expect.',
    'Give operators their conventional meaning and use explicit to avoid surprising conversions.',
    'advanced',
    array['lesson', 'quiz'],
    256
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
  ('cpp.value_semantics.special_members', 'cpp.value_semantics.move', 'recommended'),
  ('cpp.value_semantics.copy_elision', 'cpp.value_semantics.copy', 'recommended'),
  ('cpp.value_semantics.operators', 'cpp.value_semantics.rule_of_zero_five', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
