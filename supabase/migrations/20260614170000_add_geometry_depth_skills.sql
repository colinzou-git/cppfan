-- Roadmap #83 / #122 (geometry depth): dot and cross products, segment
-- intersection via orientation tests, and floating-point precision.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.math.vectors_dot_cross',
    'dsa',
    'dsa.math',
    'Vectors: dot and cross products',
    'Use the dot product for angle/projection and the 2D cross product for orientation.',
    'Interpret the dot product (angle sign) and the 2D cross product (signed area, turn direction).',
    'advanced',
    array['lesson', 'quiz'],
    2110
  ),
  (
    'dsa.math.segment_intersection',
    'dsa',
    'dsa.math',
    'Segment intersection',
    'Decide whether two segments cross using orientation (turn) tests.',
    'Use orientation tests to detect proper segment crossing and collinear-overlap cases.',
    'advanced',
    array['lesson', 'quiz'],
    2120
  ),
  (
    'dsa.math.geometry_precision',
    'dsa',
    'dsa.math',
    'Geometry precision',
    'Avoid floating-point error with integer math, squared distances, and epsilon comparisons.',
    'Prefer exact integer geometry; when using doubles, compare with an epsilon, not ==.',
    'advanced',
    array['lesson', 'quiz'],
    2130
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
  ('dsa.math.vectors_dot_cross', 'dsa.math.geometry', 'recommended'),
  ('dsa.math.segment_intersection', 'dsa.math.vectors_dot_cross', 'recommended'),
  ('dsa.math.geometry_precision', 'dsa.math.geometry', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
