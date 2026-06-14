-- Roadmap #77 / #117 (OOP safety): object slicing/upcasting, override/final,
-- and owning polymorphic objects.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.oop.slicing',
    'cpp',
    'cpp.oop',
    'Object slicing and upcasting',
    'Avoid slicing by handling polymorphic objects through references or pointers.',
    'Recognize that copying a derived object into a base value slices it; use base&/base*.',
    'advanced',
    array['lesson', 'quiz'],
    264
  ),
  (
    'cpp.oop.override_final',
    'cpp',
    'cpp.oop',
    'override and final',
    'Use override to catch signature mistakes and final to stop further overriding.',
    'Mark overrides with override and use final to seal a class or virtual function.',
    'intermediate',
    array['lesson', 'quiz'],
    265
  ),
  (
    'cpp.oop.polymorphic_ownership',
    'cpp',
    'cpp.oop',
    'Owning polymorphic objects',
    'Own polymorphic objects with unique_ptr<Base> and observe via base reference/pointer.',
    'Store polymorphic objects in unique_ptr<Base> (with a virtual destructor); pass non-owning base refs.',
    'advanced',
    array['lesson', 'quiz'],
    266
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
  ('cpp.oop.slicing', 'cpp.oop.inheritance', 'recommended'),
  ('cpp.oop.override_final', 'cpp.oop.virtual_polymorphism', 'recommended'),
  ('cpp.oop.polymorphic_ownership', 'cpp.smart_pointers.unique_ptr', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
