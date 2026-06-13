-- Roadmap #70 / #112 (template-mechanics follow-up): multiple/non-type params,
-- type deduction & instantiation, and alias templates & specialization.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.templates.multiple_params',
    'cpp',
    'cpp.templates',
    'Multiple and non-type template parameters',
    'Use several type parameters and compile-time value (non-type) parameters.',
    'Write templates with multiple type params and a non-type param like std::size_t N.',
    'advanced',
    array['lesson', 'quiz'],
    608
  ),
  (
    'cpp.templates.deduction',
    'cpp',
    'cpp.templates',
    'Type deduction and instantiation',
    'Reason about template argument deduction and why templates live in headers.',
    'Predict deduced template arguments and explain header-only instantiation/linkage.',
    'advanced',
    array['lesson', 'quiz'],
    609
  ),
  (
    'cpp.templates.aliases_specialization',
    'cpp',
    'cpp.templates',
    'Alias templates and specialization',
    'Name types with using/alias templates and introduce template specialization.',
    'Define an alias template and recognize when a specialization customizes behavior.',
    'advanced',
    array['lesson', 'quiz'],
    610
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
  ('cpp.templates.multiple_params', 'cpp.templates.function_templates', 'recommended'),
  ('cpp.templates.deduction', 'cpp.templates.function_templates', 'recommended'),
  ('cpp.templates.aliases_specialization', 'cpp.templates.class_templates', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
