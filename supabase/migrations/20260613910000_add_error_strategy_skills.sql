-- Roadmap #71 / #113 (error-strategy follow-up): preconditions/validation,
-- optional/expected for failure, and choosing an error-handling strategy.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.tooling.preconditions',
    'cpp',
    'cpp.tooling',
    'Preconditions and input validation',
    'Validate untrusted input at boundaries and assert internal preconditions.',
    'Validate external input but assert (not validate) caller contracts you control.',
    'intermediate',
    array['lesson', 'quiz'],
    708
  ),
  (
    'cpp.tooling.optional_expected',
    'cpp',
    'cpp.tooling',
    'Signaling failure with optional and expected',
    'Return std::optional for absence and std::expected for a recoverable error value.',
    'Choose std::optional for a maybe-value and std::expected to carry an error reason.',
    'advanced',
    array['lesson', 'quiz'],
    709
  ),
  (
    'cpp.tooling.error_strategy',
    'cpp',
    'cpp.tooling',
    'Choosing an error-handling strategy',
    'Pick exceptions, error codes, or optional/expected, and avoid exceptions for control flow.',
    'Select an error mechanism by recoverability and frequency; reserve exceptions for the exceptional.',
    'advanced',
    array['lesson', 'quiz'],
    710
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
  ('cpp.tooling.preconditions', 'cpp.tooling.error_handling', 'recommended'),
  ('cpp.tooling.optional_expected', 'cpp.utilities.variant', 'recommended'),
  ('cpp.tooling.error_strategy', 'cpp.tooling.optional_expected', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
