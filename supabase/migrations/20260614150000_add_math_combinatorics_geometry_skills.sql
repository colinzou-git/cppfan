-- Roadmap #83 / #122 (math, second slice): binomial coefficients and the Pascal
-- triangle, inclusion-exclusion, and polygon area (shoelace).
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.math.pascal_binomial',
    'dsa',
    'dsa.math',
    'Binomial coefficients and Pascal''s triangle',
    'Compute n-choose-k with Pascal''s recurrence and factorials.',
    'Build C(n,k) from Pascal''s recurrence or factorials and know when each fits.',
    'advanced',
    array['lesson', 'quiz'],
    2080
  ),
  (
    'dsa.math.inclusion_exclusion',
    'dsa',
    'dsa.math',
    'Inclusion-exclusion',
    'Count unions of overlapping sets by adding and subtracting intersections.',
    'Apply inclusion-exclusion to count elements in a union without double-counting.',
    'advanced',
    array['lesson', 'quiz'],
    2090
  ),
  (
    'dsa.math.geometry_area',
    'dsa',
    'dsa.math',
    'Polygon area (shoelace)',
    'Compute the area of a simple polygon with the shoelace formula.',
    'Use the shoelace formula to get a polygon''s area from its ordered vertices.',
    'advanced',
    array['lesson', 'quiz'],
    2100
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
  ('dsa.math.pascal_binomial', 'dsa.math.combinatorics', 'recommended'),
  ('dsa.math.inclusion_exclusion', 'dsa.math.combinatorics', 'recommended'),
  ('dsa.math.geometry_area', 'dsa.math.geometry', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
