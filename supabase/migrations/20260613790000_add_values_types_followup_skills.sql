-- Roadmap #66 / #108 (values/types follow-up): fundamental-type selection,
-- signed/unsigned pitfalls, and literals/expression evaluation.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.values_types.fundamental_types',
    'cpp',
    'cpp.values_types',
    'Choosing a fundamental type',
    'Pick among integers, floating point, bool, and char by range and intent.',
    'Choose int/double/bool/char appropriately and know integers are exact while doubles are approximate.',
    'beginner',
    array['lesson', 'quiz'],
    5
  ),
  (
    'cpp.values_types.signed_unsigned',
    'cpp',
    'cpp.values_types',
    'Signed and unsigned pitfalls',
    'Avoid bugs from mixing signed and unsigned integers and from unsigned wraparound.',
    'Spot signed/unsigned comparison and wraparound bugs, e.g. with container .size().',
    'intermediate',
    array['lesson', 'quiz'],
    6
  ),
  (
    'cpp.values_types.literals',
    'cpp',
    'cpp.values_types',
    'Literals and expression evaluation',
    'Read literals and evaluate expressions, including integer division.',
    'Predict an expression''s value, including integer division and operator precedence.',
    'beginner',
    array['lesson', 'quiz'],
    7
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
  ('cpp.values_types.fundamental_types', 'cpp.values_types.variables', 'recommended'),
  ('cpp.values_types.signed_unsigned', 'cpp.values_types.fundamental_types', 'recommended'),
  ('cpp.values_types.literals', 'cpp.values_types.variables', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
