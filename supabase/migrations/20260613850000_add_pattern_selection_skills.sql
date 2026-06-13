-- Roadmap #68 / #110 (pattern-selection follow-up): pattern recognition,
-- container selection, and recursion/backtracking choice.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.complexity.pattern_recognition',
    'dsa',
    'dsa.complexity',
    'Recognizing the right pattern',
    'Map common problem cues to a frequency map, two-pointer/window, prefix, or sort-then-scan approach.',
    'Read a problem''s cues and pick the standard pattern that fits before coding.',
    'intermediate',
    array['lesson', 'quiz'],
    1010
  ),
  (
    'dsa.complexity.container_selection',
    'dsa',
    'dsa.complexity',
    'Choosing a container from operations',
    'Pick vector/map/unordered_map/set/stack/queue/priority_queue from the operations a task needs.',
    'Choose a container by the operations and complexity a problem requires.',
    'intermediate',
    array['lesson', 'quiz'],
    1011
  ),
  (
    'dsa.complexity.recursion_choice',
    'dsa',
    'dsa.complexity',
    'Recursion, iteration, and backtracking',
    'Decide when recursion or backtracking fits versus a plain iterative loop.',
    'Recognize recursive/backtracking structure and when iteration is simpler.',
    'advanced',
    array['lesson', 'quiz'],
    1012
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
  ('dsa.complexity.pattern_recognition', 'dsa.complexity.problem_solving', 'recommended'),
  ('dsa.complexity.container_selection', 'dsa.complexity.problem_solving', 'recommended'),
  ('dsa.complexity.recursion_choice', 'dsa.recursion.base_case', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
