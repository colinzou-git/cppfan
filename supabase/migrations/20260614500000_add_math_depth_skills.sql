-- Roadmap #83 / #122 (math depth): the fundamental counting principle, generating
-- combinations/subsets (backtracking), and the convex hull.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.math.counting_principle',
    'dsa',
    'dsa.math',
    'The fundamental counting principle',
    'Multiply independent sequential choices; add disjoint mutually-exclusive cases.',
    'Apply the rule of product and rule of sum, and tell independent choices from disjoint cases.',
    'intermediate',
    array['lesson', 'quiz'],
    2140
  ),
  (
    'dsa.math.generate_combinations',
    'dsa',
    'dsa.math',
    'Generating combinations and subsets',
    'Enumerate combinations/subsets with start-index backtracking, distinct from counting them.',
    'Generate all k-combinations or subsets with choose/recurse/undo and explain why each appears once.',
    'advanced',
    array['lesson', 'quiz'],
    2150
  ),
  (
    'dsa.math.convex_hull',
    'dsa',
    'dsa.math',
    'Convex hull (monotone chain)',
    'Build the smallest enclosing convex polygon in O(n log n) using the cross-product turn test.',
    'Construct a convex hull with the monotone chain method and the cross-product orientation test.',
    'advanced',
    array['lesson', 'quiz'],
    2160
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
  ('dsa.math.counting_principle', 'dsa.complexity.big_o', 'recommended'),
  ('dsa.math.generate_combinations', 'dsa.math.combinatorics', 'recommended'),
  ('dsa.math.convex_hull', 'dsa.math.vectors_dot_cross', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
