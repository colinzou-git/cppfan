-- Roadmap #69 / #111 (value-semantics depth): self-assignment safety,
-- shallow-vs-deep copy (bug spotting), and stream insertion.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.value_semantics.self_assignment',
    'cpp',
    'cpp.value_semantics',
    'Self-assignment safety',
    'Write assignment that stays correct when an object is assigned to itself.',
    'Make a hand-written assignment self-assignment safe (guard or copy-and-swap).',
    'advanced',
    array['lesson', 'quiz'],
    257
  ),
  (
    'cpp.value_semantics.deep_copy',
    'cpp',
    'cpp.value_semantics',
    'Shallow vs deep copy',
    'Spot a shallow copy of an owned pointer that leads to double free or shared state.',
    'Recognize a shallow-copy bug and fix it with a deep copy or self-managing member.',
    'advanced',
    array['lesson', 'bug_spotting'],
    258
  ),
  (
    'cpp.value_semantics.stream_insertion',
    'cpp',
    'cpp.value_semantics',
    'Stream insertion (operator<<)',
    'Print a type by overloading operator<< as a non-member taking std::ostream&.',
    'Define operator<<(std::ostream&, const T&) to make a type printable.',
    'intermediate',
    array['lesson', 'quiz'],
    259
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
  ('cpp.value_semantics.self_assignment', 'cpp.value_semantics.special_members', 'recommended'),
  ('cpp.value_semantics.deep_copy', 'cpp.value_semantics.copy', 'recommended'),
  ('cpp.value_semantics.stream_insertion', 'cpp.value_semantics.operators', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
