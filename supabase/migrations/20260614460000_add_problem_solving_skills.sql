-- Roadmap #68 / #110 (problem-solving process): framing a problem, boundary and
-- adversarial examples, and brute-force-then-optimize.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.complexity.problem_framing',
    'dsa',
    'dsa.complexity',
    'Framing a problem before coding',
    'Restate inputs, outputs, constraints, and invariants before writing a solution.',
    'Pin down inputs/outputs/constraints and state the invariant a solution maintains.',
    'intermediate',
    array['lesson', 'quiz'],
    1013
  ),
  (
    'dsa.complexity.test_examples',
    'dsa',
    'dsa.complexity',
    'Boundary and adversarial examples',
    'Build edge-case and adversarial examples to expose missing cases and wrong shortcuts.',
    'Construct boundary and adversarial examples and use a counterexample to discard a wrong approach.',
    'intermediate',
    array['lesson', 'quiz'],
    1014
  ),
  (
    'dsa.complexity.bruteforce_then_optimize',
    'dsa',
    'dsa.complexity',
    'Brute force first, then remove repeated work',
    'Start from a correct brute force, then optimize by eliminating redundant recomputation.',
    'Use a brute force as a correctness oracle and identify the repeated work to optimize away.',
    'advanced',
    array['lesson', 'quiz'],
    1015
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
  ('dsa.complexity.problem_framing', 'dsa.complexity.problem_solving', 'recommended'),
  ('dsa.complexity.test_examples', 'dsa.complexity.problem_solving', 'recommended'),
  ('dsa.complexity.bruteforce_then_optimize', 'dsa.complexity.problem_solving', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
