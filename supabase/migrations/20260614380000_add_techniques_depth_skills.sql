-- Roadmap #76 / #116 (algorithmic techniques depth): 2-D prefix sums and
-- difference arrays, interval scheduling / sorting as preprocessing, and common
-- DP forms with solution reconstruction.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.techniques.prefix_2d',
    'dsa',
    'dsa.techniques',
    '2-D prefix sums and difference arrays',
    'Answer submatrix-sum queries in O(1) and apply range updates with difference arrays.',
    'Build a 2-D prefix-sum table for O(1) rectangle sums and use a difference array for range updates.',
    'advanced',
    array['lesson', 'quiz'],
    1880
  ),
  (
    'dsa.techniques.interval_scheduling',
    'dsa',
    'dsa.techniques',
    'Interval scheduling and sorting as preprocessing',
    'Select the most non-overlapping intervals by sorting on the right endpoint.',
    'Solve interval scheduling greedily (sort by end, take compatible) and use sorting to set up problems.',
    'advanced',
    array['lesson', 'quiz'],
    1890
  ),
  (
    'dsa.techniques.dp_forms',
    'dsa',
    'dsa.techniques',
    'Common DP forms and reconstruction',
    'Recognize 1-D, grid, knapsack, and subsequence DP, and reconstruct the chosen solution.',
    'Map a problem to a common DP form and rebuild the answer by tracing the table back.',
    'advanced',
    array['lesson', 'quiz'],
    1900
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
  ('dsa.techniques.prefix_2d', 'dsa.techniques.prefix_sums', 'recommended'),
  ('dsa.techniques.interval_scheduling', 'dsa.techniques.greedy', 'recommended'),
  ('dsa.techniques.dp_forms', 'dsa.techniques.dp_design', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
