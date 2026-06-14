-- Roadmap #80 / #121 (utilities, third slice): chrono clocks/durations, quality
-- random numbers, and whole-line getline input.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.utilities.chrono_depth',
    'cpp',
    'cpp.utilities',
    'Clocks, durations, and time points',
    'Measure elapsed time with the right clock and convert durations explicitly.',
    'Time code with steady_clock and convert durations with duration_cast.',
    'intermediate',
    array['lesson', 'quiz'],
    770
  ),
  (
    'cpp.utilities.random_quality',
    'cpp',
    'cpp.utilities',
    'Quality random numbers',
    'Separate engine from distribution and avoid rand()%n modulo bias.',
    'Seed an engine once and draw from a distribution instead of using rand()%n.',
    'intermediate',
    array['lesson', 'quiz'],
    771
  ),
  (
    'cpp.utilities.getline_input',
    'cpp',
    'cpp.utilities',
    'Whole-line input with getline',
    'Read complete lines with std::getline and mix it safely with >> extraction.',
    'Read full lines with std::getline and clear the leftover newline after >>.',
    'intermediate',
    array['lesson', 'quiz'],
    772
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
  ('cpp.utilities.chrono_depth', 'cpp.utilities.chrono', 'recommended'),
  ('cpp.utilities.random_quality', 'cpp.utilities.random', 'recommended'),
  ('cpp.utilities.getline_input', 'cpp.utilities.stream_validation', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
