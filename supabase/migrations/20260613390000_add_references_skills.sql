-- Roadmap #65 / #67 (stage 2): references, pointers, const correctness, and
-- parameter passing. Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.references.references',
    'cpp',
    'cpp.references',
    'References',
    'Use lvalue references as aliases for existing objects.',
    'Bind a reference and use it to modify the caller''s object.',
    'beginner',
    array['lesson', 'quiz'],
    90
  ),
  (
    'cpp.references.pointers',
    'cpp',
    'cpp.references',
    'Pointers and nullptr',
    'Hold addresses, dereference safely, and handle nullptr.',
    'Take an address, dereference a pointer, and avoid null dereferences.',
    'beginner',
    array['lesson', 'quiz'],
    91
  ),
  (
    'cpp.references.const_correctness',
    'cpp',
    'cpp.references',
    'Const correctness',
    'Use const to express and enforce read-only intent.',
    'Apply const to parameters and methods to prevent accidental modification.',
    'intermediate',
    array['lesson', 'quiz'],
    92
  ),
  (
    'cpp.references.parameter_passing',
    'cpp',
    'cpp.references',
    'Parameter passing',
    'Choose by-value, const-reference, or reference for parameters.',
    'Pass small types by value, large read-only types by const reference, and outputs by reference.',
    'intermediate',
    array['lesson', 'quiz'],
    93
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
  ('cpp.references.references', 'cpp.functions.basics', 'recommended'),
  ('cpp.references.pointers', 'cpp.references.references', 'recommended'),
  ('cpp.references.const_correctness', 'cpp.references.references', 'recommended'),
  ('cpp.references.parameter_passing', 'cpp.references.const_correctness', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
