-- Roadmap #80 / #121 (utilities, second slice): filesystem paths/directories,
-- text vs binary I/O, and visiting a variant with std::visit.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.utilities.filesystem',
    'cpp',
    'cpp.utilities',
    'Filesystem paths and directories',
    'Compose portable paths and iterate directories with std::filesystem.',
    'Build paths with operator/, check existence/type, and iterate a directory portably.',
    'intermediate',
    array['lesson', 'quiz'],
    767
  ),
  (
    'cpp.utilities.binary_io',
    'cpp',
    'cpp.utilities',
    'Text vs binary I/O',
    'Choose text or binary streams and read/write raw bytes without newline translation.',
    'Open a stream with std::ios::binary and use read/write for exact byte-for-byte I/O.',
    'intermediate',
    array['lesson', 'quiz'],
    768
  ),
  (
    'cpp.utilities.variant_visit',
    'cpp',
    'cpp.utilities',
    'Visiting a variant',
    'Handle every alternative of a std::variant exhaustively with std::visit.',
    'Use std::visit with an overload set to handle each type a variant can hold.',
    'advanced',
    array['lesson', 'quiz'],
    769
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
  ('cpp.utilities.filesystem', 'cpp.utilities.file_io', 'recommended'),
  ('cpp.utilities.binary_io', 'cpp.utilities.file_io', 'recommended'),
  ('cpp.utilities.variant_visit', 'cpp.utilities.variant', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
