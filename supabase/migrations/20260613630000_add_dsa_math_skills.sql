-- Roadmap #65 / #83 (stage 14): math — bit manipulation, number theory, combinatorics, geometry.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.math.bit_manipulation',
    'dsa',
    'dsa.math',
    'Bit manipulation',
    'Use bitwise operators and masks to test, set, and clear bits.',
    'Test, set, and clear individual bits and use common bit tricks.',
    'advanced',
    array['lesson', 'quiz'],
    2010
  ),
  (
    'dsa.math.number_theory',
    'dsa',
    'dsa.math',
    'Number theory',
    'Apply GCD, primality, and modular arithmetic in algorithms.',
    'Compute GCD with Euclid''s algorithm and reason about modular arithmetic.',
    'advanced',
    array['lesson', 'quiz'],
    2020
  ),
  (
    'dsa.math.combinatorics',
    'dsa',
    'dsa.math',
    'Combinatorics',
    'Count arrangements and selections with permutations and combinations.',
    'Choose between permutations and combinations and count outcomes.',
    'advanced',
    array['lesson', 'quiz'],
    2030
  ),
  (
    'dsa.math.geometry',
    'dsa',
    'dsa.math',
    'Computational geometry',
    'Work with points, distances, and orientation tests.',
    'Compute distances and use the cross product to test orientation.',
    'advanced',
    array['lesson', 'quiz'],
    2040
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
  ('dsa.math.bit_manipulation', 'cpp.values_types.variables', 'recommended'),
  ('dsa.math.number_theory', 'dsa.complexity.big_o', 'recommended'),
  ('dsa.math.combinatorics', 'dsa.math.number_theory', 'recommended'),
  ('dsa.math.geometry', 'cpp.functions.basics', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
