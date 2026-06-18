-- Roadmap #68 / #110 finishing slice: explicit time/space tradeoffs and
-- informal correctness reasoning skills.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.complexity.time_space_tradeoffs',
    'dsa',
    'dsa.complexity',
    'Time and space tradeoffs',
    'Trade extra memory for faster queries, and recognize when memory limits rule out an approach.',
    'Choose when precomputation, hashing, or prefix data is worth the extra space.',
    'intermediate',
    array['lesson', 'quiz'],
    1010
  ),
  (
    'dsa.complexity.correctness_reasoning',
    'dsa',
    'dsa.complexity',
    'Informal correctness reasoning',
    'Explain why an algorithm maintains its invariant and terminates with the right answer.',
    'Give a short correctness argument using the invariant, progress, and termination.',
    'advanced',
    array['lesson', 'quiz'],
    1016
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
  ('dsa.complexity.time_space_tradeoffs', 'dsa.complexity.constraints', 'recommended'),
  ('dsa.complexity.correctness_reasoning', 'dsa.complexity.bruteforce_then_optimize', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
