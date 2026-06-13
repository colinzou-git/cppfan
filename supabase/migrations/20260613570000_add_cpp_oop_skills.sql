-- Roadmap #65 / #77 (stage 11): object-oriented design — composition, inheritance, polymorphism.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.oop.composition',
    'cpp',
    'cpp.oop',
    'Composition',
    'Model has-a relationships by holding objects as members.',
    'Prefer composition for has-a relationships and reuse without inheritance.',
    'intermediate',
    array['lesson', 'quiz'],
    260
  ),
  (
    'cpp.oop.inheritance',
    'cpp',
    'cpp.oop',
    'Inheritance',
    'Model is-a relationships by deriving a class from a base.',
    'Use public inheritance for is-a relationships and access inherited members.',
    'intermediate',
    array['lesson', 'quiz'],
    261
  ),
  (
    'cpp.oop.virtual_polymorphism',
    'cpp',
    'cpp.oop',
    'Virtual functions and polymorphism',
    'Call derived behavior through a base pointer with virtual functions.',
    'Use virtual functions for runtime dispatch and a virtual destructor on base classes.',
    'advanced',
    array['lesson', 'quiz'],
    262
  ),
  (
    'cpp.oop.abstract_interfaces',
    'cpp',
    'cpp.oop',
    'Abstract classes and interfaces',
    'Define interfaces with pure virtual functions that derived classes implement.',
    'Declare a pure virtual function to create an interface other classes implement.',
    'advanced',
    array['lesson', 'quiz'],
    263
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
  ('cpp.oop.composition', 'cpp.structs_classes.public_private', 'recommended'),
  ('cpp.oop.inheritance', 'cpp.structs_classes.public_private', 'recommended'),
  ('cpp.oop.virtual_polymorphism', 'cpp.oop.inheritance', 'recommended'),
  ('cpp.oop.abstract_interfaces', 'cpp.oop.virtual_polymorphism', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
