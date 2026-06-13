-- Roadmap #65 / #66: C++ foundations (stage 1, part 2) — control flow and
-- functions. Completes the beginner on-ramp before structs/classes.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.control_flow.conditionals',
    'cpp',
    'cpp.control_flow',
    'Conditionals',
    'Branch with if/else and switch using comparison and logical operators.',
    'Write correct if/else and switch logic and avoid switch fall-through.',
    'beginner',
    array['lesson', 'quiz'],
    5
  ),
  (
    'cpp.control_flow.loops',
    'cpp',
    'cpp.control_flow',
    'Loops',
    'Repeat with for/while and control flow with break/continue.',
    'Write a loop that runs the right number of times and avoid off-by-one errors.',
    'beginner',
    array['lesson', 'quiz', 'bug_spotting'],
    6
  ),
  (
    'cpp.functions.basics',
    'cpp',
    'cpp.functions',
    'Function basics',
    'Declare functions with parameters, return values, and local scope.',
    'Write and call a function, and explain where its local variables live.',
    'beginner',
    array['lesson', 'quiz', 'code_reading'],
    7
  ),
  (
    'cpp.functions.decomposition',
    'cpp',
    'cpp.functions',
    'Decomposition and headers',
    'Split work into small functions and across header/source files.',
    'Break a task into small, well-named functions and place declarations in a header.',
    'beginner',
    array['lesson', 'quiz'],
    8
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
  ('cpp.control_flow.conditionals', 'cpp.values_types.variables', 'recommended'),
  ('cpp.control_flow.loops', 'cpp.control_flow.conditionals', 'recommended'),
  ('cpp.functions.basics', 'cpp.control_flow.loops', 'recommended'),
  ('cpp.functions.decomposition', 'cpp.functions.basics', 'recommended'),
  ('cpp.structs_classes.syntax', 'cpp.functions.basics', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
