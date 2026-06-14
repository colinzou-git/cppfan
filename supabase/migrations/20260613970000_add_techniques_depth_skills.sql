-- Roadmap #76 / #116 (techniques depth): range-query structures, greedy proofs,
-- and DP design.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.techniques.range_structures',
    'dsa',
    'dsa.techniques',
    'Range query structures',
    'Choose prefix sums, a Fenwick tree, or a segment tree by update/query needs.',
    'Pick a static prefix sum vs a Fenwick/segment tree based on whether values update.',
    'advanced',
    array['lesson', 'quiz'],
    1850
  ),
  (
    'dsa.techniques.greedy_proof',
    'dsa',
    'dsa.techniques',
    'Greedy proofs and counterexamples',
    'Justify a greedy choice with an exchange argument and find where greedy fails.',
    'Argue a greedy choice is safe (exchange argument) or disprove it with a counterexample.',
    'advanced',
    array['lesson', 'quiz'],
    1860
  ),
  (
    'dsa.techniques.dp_design',
    'dsa',
    'dsa.techniques',
    'Designing a DP',
    'Define state, transition, base case, and evaluation order; memoize or tabulate.',
    'Specify a DP state/transition/base/order and choose memoization vs tabulation.',
    'advanced',
    array['lesson', 'quiz'],
    1870
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
  ('dsa.techniques.range_structures', 'dsa.techniques.prefix_sums', 'recommended'),
  ('dsa.techniques.greedy_proof', 'dsa.techniques.greedy', 'recommended'),
  ('dsa.techniques.dp_design', 'dsa.techniques.dynamic_programming', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
