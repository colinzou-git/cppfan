-- Roadmap #67 / #109 (references follow-up): lvalue/rvalue, return semantics,
-- and dangling references / lifetimes.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.references.lvalue_rvalue',
    'cpp',
    'cpp.references',
    'Lvalues and rvalues',
    'Tell apart named objects (lvalues) and temporaries (rvalues).',
    'Decide whether an expression is an lvalue or an rvalue and why it matters for binding.',
    'intermediate',
    array['lesson', 'quiz'],
    94
  ),
  (
    'cpp.references.return_semantics',
    'cpp',
    'cpp.references',
    'Return by value vs by reference',
    'Choose between returning a value and returning a reference safely.',
    'Return by value by default; return a reference only to storage that outlives the call.',
    'intermediate',
    array['lesson', 'quiz'],
    95
  ),
  (
    'cpp.references.dangling',
    'cpp',
    'cpp.references',
    'Dangling references and lifetimes',
    'Spot references that outlive their referent and the limits of lifetime extension.',
    'Identify a dangling reference and know that lifetime extension does not survive a return.',
    'advanced',
    array['lesson', 'quiz'],
    96
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
  ('cpp.references.lvalue_rvalue', 'cpp.references.references', 'recommended'),
  ('cpp.references.return_semantics', 'cpp.references.references', 'recommended'),
  ('cpp.references.dangling', 'cpp.references.return_semantics', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
