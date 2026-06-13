-- Roadmap #65 / #68 (stage 3): algorithm complexity and systematic problem
-- solving. Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.complexity.big_o',
    'dsa',
    'dsa.complexity',
    'Big-O notation',
    'Describe how running time grows with input size, ignoring constants.',
    'Name the Big-O of common loops and pick the dominant term.',
    'intermediate',
    array['lesson', 'quiz'],
    1005
  ),
  (
    'dsa.complexity.problem_solving',
    'dsa',
    'dsa.complexity',
    'Systematic problem solving',
    'Work from understanding to brute force to an optimized, tested solution.',
    'Follow a repeatable process: understand, example, brute force, optimize, test.',
    'intermediate',
    array['lesson', 'quiz'],
    1006
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
  ('dsa.complexity.problem_solving', 'dsa.complexity.big_o', 'recommended'),
  ('dsa.arrays.indexing', 'dsa.complexity.big_o', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
