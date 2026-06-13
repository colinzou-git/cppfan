-- Roadmap #65 / #80 (stage 13): utility libraries — file I/O, filesystem, chrono, random, variant.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.utilities.file_io',
    'cpp',
    'cpp.utilities',
    'File I/O and filesystem',
    'Read and write files with fstream and inspect paths with std::filesystem.',
    'Open a file with ofstream/ifstream and check existence with std::filesystem.',
    'intermediate',
    array['lesson', 'quiz'],
    760
  ),
  (
    'cpp.utilities.chrono',
    'cpp',
    'cpp.utilities',
    'Time with chrono',
    'Measure durations and elapsed time with std::chrono clocks.',
    'Time a code block with steady_clock and convert the duration to milliseconds.',
    'intermediate',
    array['lesson', 'quiz'],
    761
  ),
  (
    'cpp.utilities.random',
    'cpp',
    'cpp.utilities',
    'Random numbers',
    'Generate quality random values with <random> engines and distributions.',
    'Use a random engine plus a distribution instead of rand() % n.',
    'intermediate',
    array['lesson', 'quiz'],
    762
  ),
  (
    'cpp.utilities.variant',
    'cpp',
    'cpp.utilities',
    'Variant and optional',
    'Model alternatives with std::variant and maybe-values with std::optional.',
    'Use std::optional for a maybe-value and std::variant for a type-safe union.',
    'advanced',
    array['lesson', 'quiz'],
    763
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
  ('cpp.utilities.file_io', 'cpp.program_basics.io', 'recommended'),
  ('cpp.utilities.chrono', 'cpp.functions.basics', 'recommended'),
  ('cpp.utilities.random', 'cpp.functions.basics', 'recommended'),
  ('cpp.utilities.variant', 'cpp.templates.class_templates', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
