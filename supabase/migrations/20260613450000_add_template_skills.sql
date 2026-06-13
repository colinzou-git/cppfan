-- Roadmap #65 / #70 (stage 5): templates, generic programming, concepts, ranges.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.templates.function_templates',
    'cpp',
    'cpp.templates',
    'Function templates',
    'Write one function that works for many types via template type deduction.',
    'Define and call a function template and explain how T is deduced.',
    'intermediate',
    array['lesson', 'quiz'],
    601
  ),
  (
    'cpp.templates.class_templates',
    'cpp',
    'cpp.templates',
    'Class templates',
    'Parameterize a class by type, like the standard containers.',
    'Define and instantiate a simple class template.',
    'intermediate',
    array['lesson', 'quiz'],
    602
  ),
  (
    'cpp.templates.concepts',
    'cpp',
    'cpp.templates',
    'Concepts',
    'Constrain template parameters with C++20 concepts for clearer intent and errors.',
    'Constrain a template parameter to types that satisfy a requirement.',
    'advanced',
    array['lesson', 'quiz'],
    603
  ),
  (
    'cpp.templates.ranges',
    'cpp',
    'cpp.templates',
    'Ranges and views',
    'Operate on whole ranges and compose lazy views (C++20).',
    'Use a range algorithm and a composed view without manual iterators.',
    'advanced',
    array['lesson', 'quiz'],
    604
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
  ('cpp.templates.function_templates', 'cpp.functions.basics', 'recommended'),
  ('cpp.templates.class_templates', 'cpp.templates.function_templates', 'recommended'),
  ('cpp.templates.concepts', 'cpp.templates.function_templates', 'recommended'),
  ('cpp.templates.ranges', 'cpp.stl.algorithms', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
