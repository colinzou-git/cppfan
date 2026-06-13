-- Expand the smart pointers module (#45) with two ownership skills:
-- choosing the right ownership, and ownership transfer with std::move.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.smart_pointers.ownership_choice',
    'cpp',
    'cpp.smart_pointers',
    'Choosing the right ownership',
    'Decide between a stack object, a value member, a non-owning reference, and a smart pointer.',
    'Pick the simplest ownership that works, and avoid reaching for a smart pointer when a value or reference is enough.',
    'intermediate',
    array['lesson', 'quiz', 'code_reading'],
    350
  ),
  (
    'cpp.smart_pointers.ownership_transfer',
    'cpp',
    'cpp.smart_pointers',
    'Ownership transfer with std::move',
    'Transfer exclusive ownership of a unique_ptr with std::move and understand the moved-from state.',
    'Move a unique_ptr to hand off ownership and explain why the source becomes empty.',
    'intermediate',
    array['lesson', 'quiz', 'bug_spotting'],
    360
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
  ('cpp.smart_pointers.ownership_choice', 'cpp.raii.ownership_boundary', 'recommended'),
  ('cpp.smart_pointers.ownership_transfer', 'cpp.smart_pointers.unique_ptr', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
