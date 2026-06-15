-- Roadmap #71 / #113 (tooling depth): a systematic debugging method, writing good
-- unit tests, and regression tests + determinism.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.tooling.debugging_method',
    'cpp',
    'cpp.tooling',
    'A systematic debugging method',
    'Classify the failure, build a minimal repro, and bisect the cause with breakpoints and watches.',
    'Debug methodically: classify the failure, reduce to a minimal repro, and narrow the cause step by step.',
    'intermediate',
    array['lesson', 'quiz'],
    711
  ),
  (
    'cpp.tooling.unit_testing',
    'cpp',
    'cpp.tooling',
    'Writing good unit tests',
    'Structure tests as arrange/act/assert, one behavior each, fast and deterministic.',
    'Write a focused arrange/act/assert unit test that checks one behavior and is deterministic.',
    'intermediate',
    array['lesson', 'quiz'],
    712
  ),
  (
    'cpp.tooling.regression_testing',
    'cpp',
    'cpp.tooling',
    'Regression tests and determinism',
    'Reproduce a bug with a failing test before fixing it, and keep tests deterministic.',
    'Add a failing regression test that reproduces a bug, and avoid time/random/network nondeterminism.',
    'intermediate',
    array['lesson', 'quiz'],
    713
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
  ('cpp.tooling.debugging_method', 'cpp.tooling.debugging', 'recommended'),
  ('cpp.tooling.unit_testing', 'cpp.tooling.testing', 'recommended'),
  ('cpp.tooling.regression_testing', 'cpp.tooling.testing', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
