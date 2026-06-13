-- Roadmap #65 / #71 (stage 6): testing, debugging, error handling, build tooling.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.tooling.error_handling',
    'cpp',
    'cpp.tooling',
    'Error handling',
    'Use exceptions and error returns to signal and handle failures.',
    'Throw and catch exceptions and choose between exceptions and error returns.',
    'intermediate',
    array['lesson', 'quiz'],
    701
  ),
  (
    'cpp.tooling.testing',
    'cpp',
    'cpp.tooling',
    'Testing',
    'Write unit tests and assertions to verify behavior.',
    'Write a small unit test that fails before a fix and passes after.',
    'intermediate',
    array['lesson', 'quiz'],
    702
  ),
  (
    'cpp.tooling.debugging',
    'cpp',
    'cpp.tooling',
    'Debugging',
    'Locate bugs with a debugger, breakpoints, and targeted output.',
    'Use a debugger and a minimal reproduction to isolate a bug.',
    'intermediate',
    array['lesson', 'quiz'],
    703
  ),
  (
    'cpp.tooling.build',
    'cpp',
    'cpp.tooling',
    'Compiling and building',
    'Understand compile vs link and the role of a build system.',
    'Explain the compile/link stages and what a build system automates.',
    'intermediate',
    array['lesson', 'quiz'],
    704
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
  ('cpp.tooling.error_handling', 'cpp.functions.basics', 'recommended'),
  ('cpp.tooling.testing', 'cpp.functions.basics', 'recommended'),
  ('cpp.tooling.debugging', 'cpp.tooling.testing', 'recommended'),
  ('cpp.tooling.build', 'cpp.functions.decomposition', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
