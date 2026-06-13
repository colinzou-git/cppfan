-- Roadmap #65 / #69 (stage 4): value semantics — copy, move, Rule of Zero/Five.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.value_semantics.copy',
    'cpp',
    'cpp.value_semantics',
    'Copy semantics',
    'Understand copy constructor/assignment and deep vs shallow copies.',
    'Explain why a class owning a raw resource needs a deep copy.',
    'intermediate',
    array['lesson', 'quiz'],
    251
  ),
  (
    'cpp.value_semantics.move',
    'cpp',
    'cpp.value_semantics',
    'Move semantics',
    'Transfer resources with move constructor/assignment and std::move.',
    'Explain how a move steals resources and leaves the source valid but empty.',
    'intermediate',
    array['lesson', 'quiz'],
    252
  ),
  (
    'cpp.value_semantics.rule_of_zero_five',
    'cpp',
    'cpp.value_semantics',
    'Rule of Zero and Rule of Five',
    'Prefer self-managing members; if you write one special member, write all five.',
    'Apply the Rule of Zero and recognize when the Rule of Five applies.',
    'intermediate',
    array['lesson', 'quiz'],
    253
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
  ('cpp.value_semantics.copy', 'cpp.constructors.destructor_intro', 'recommended'),
  ('cpp.value_semantics.move', 'cpp.value_semantics.copy', 'recommended'),
  ('cpp.value_semantics.rule_of_zero_five', 'cpp.value_semantics.move', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
