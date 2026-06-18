-- Roadmap #66 / #108 (foundations depth): initialization pitfalls,
-- declarations/definitions, headers, and namespaces.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.values_types.initialization_pitfalls',
    'cpp',
    'cpp.values_types',
    'Initialization and const intent',
    'Avoid uninitialized values, choose initialization forms, and use const/constexpr/auto deliberately.',
    'Initialize every object, spot narrowing and indeterminate-value bugs, and choose const/constexpr/auto by intent.',
    'beginner',
    array['lesson', 'bug_spotting'],
    5
  ),
  (
    'cpp.functions.declarations_definitions',
    'cpp',
    'cpp.functions',
    'Declarations, definitions, and headers',
    'Separate function declarations from definitions and place shared declarations in headers.',
    'Explain why callers need declarations, why definitions must exist once, and how headers/source files fit together.',
    'beginner',
    array['lesson', 'code_reading'],
    9
  ),
  (
    'cpp.functions.namespaces',
    'cpp',
    'cpp.functions',
    'Namespaces and name collisions',
    'Use namespaces to group names and avoid collisions across files and libraries.',
    'Read qualified names, avoid broad using-directives in headers, and resolve same-name functions safely.',
    'beginner',
    array['lesson', 'quiz'],
    10
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

-- Keep values/types ordering aligned after inserting initialization_pitfalls.
update public.skills
set order_index = case id
  when 'cpp.values_types.fundamental_types' then 6
  when 'cpp.values_types.signed_unsigned' then 7
  when 'cpp.values_types.literals' then 8
  else order_index
end,
updated_at = now()
where id in (
  'cpp.values_types.fundamental_types',
  'cpp.values_types.signed_unsigned',
  'cpp.values_types.literals'
);

insert into public.skill_prerequisites (skill_id, prerequisite_skill_id, relationship_type)
values
  ('cpp.values_types.initialization_pitfalls', 'cpp.values_types.conversions', 'recommended'),
  ('cpp.functions.declarations_definitions', 'cpp.functions.decomposition', 'recommended'),
  ('cpp.functions.namespaces', 'cpp.functions.declarations_definitions', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
