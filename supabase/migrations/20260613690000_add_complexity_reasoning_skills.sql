-- Roadmap #68 / #110 (complexity follow-up): growth-rate comparison, amortized
-- analysis, and reading input constraints.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.complexity.growth_rates',
    'dsa',
    'dsa.complexity',
    'Comparing growth rates',
    'Order common complexities and count the dominant operations in a loop.',
    'Rank O(1), O(log n), O(n), O(n log n), O(n^2), and exponential, and find the dominant term.',
    'intermediate',
    array['lesson', 'quiz'],
    1007
  ),
  (
    'dsa.complexity.amortized',
    'dsa',
    'dsa.complexity',
    'Amortized analysis',
    'Reason about average cost per operation across a sequence, like vector::push_back.',
    'Explain why vector::push_back is amortized O(1) despite occasional resizes.',
    'advanced',
    array['lesson', 'quiz'],
    1008
  ),
  (
    'dsa.complexity.constraints',
    'dsa',
    'dsa.complexity',
    'Reading input constraints',
    'Use input size limits to infer a feasible target complexity and spot hidden costs.',
    'Reject infeasible approaches from input bounds and detect hidden nested-loop cost.',
    'intermediate',
    array['lesson', 'quiz'],
    1009
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
  ('dsa.complexity.growth_rates', 'dsa.complexity.big_o', 'recommended'),
  ('dsa.complexity.amortized', 'dsa.complexity.growth_rates', 'recommended'),
  ('dsa.complexity.constraints', 'dsa.complexity.growth_rates', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
