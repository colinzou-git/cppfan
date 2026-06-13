-- Roadmap #70 / #112 (templates follow-up): compile-time programming —
-- constexpr, if constexpr, and static_assert.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.templates.constexpr',
    'cpp',
    'cpp.templates',
    'constexpr functions and values',
    'Evaluate functions and values at compile time with constexpr.',
    'Write a constexpr function and know when it runs at compile time vs run time.',
    'advanced',
    array['lesson', 'quiz'],
    605
  ),
  (
    'cpp.templates.if_constexpr',
    'cpp',
    'cpp.templates',
    'if constexpr',
    'Select a branch at compile time so the discarded branch is not instantiated.',
    'Use if constexpr to pick code per type without invalid branches being compiled.',
    'advanced',
    array['lesson', 'quiz'],
    606
  ),
  (
    'cpp.templates.static_assert',
    'cpp',
    'cpp.templates',
    'static_assert',
    'Enforce compile-time invariants with a clear message.',
    'Add a static_assert that fails the build with a readable message when an assumption breaks.',
    'intermediate',
    array['lesson', 'quiz'],
    607
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
  ('cpp.templates.constexpr', 'cpp.functions.basics', 'recommended'),
  ('cpp.templates.if_constexpr', 'cpp.templates.function_templates', 'recommended'),
  ('cpp.templates.static_assert', 'cpp.templates.constexpr', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
