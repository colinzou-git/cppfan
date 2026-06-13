-- Roadmap #67 / #109 (pointer-semantics follow-up): pointer-to-const vs const
-- pointer, non-owning pointers + selection, and non-owning views.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.references.pointer_const',
    'cpp',
    'cpp.references',
    'Pointer-to-const vs const pointer',
    'Tell apart a pointer to const data and a const pointer to mutable data.',
    'Read const placement to know whether the pointee or the pointer itself is const.',
    'intermediate',
    array['lesson', 'quiz'],
    97
  ),
  (
    'cpp.references.non_owning',
    'cpp',
    'cpp.references',
    'Non-owning pointers and selection',
    'Use raw pointers only as non-owning observers and choose pointer vs reference.',
    'Treat a raw pointer as a non-owning, nullable observer and pick reference when non-null.',
    'intermediate',
    array['lesson', 'quiz'],
    98
  ),
  (
    'cpp.references.views',
    'cpp',
    'cpp.references',
    'Non-owning views: span and string_view',
    'Pass arrays/strings as std::span / std::string_view without unsafe pointer arithmetic.',
    'Use a view to borrow a range safely instead of pointer+length and raw arithmetic.',
    'advanced',
    array['lesson', 'quiz'],
    99
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
  ('cpp.references.pointer_const', 'cpp.references.const_correctness', 'recommended'),
  ('cpp.references.non_owning', 'cpp.references.pointers', 'recommended'),
  ('cpp.references.views', 'cpp.references.non_owning', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
