-- Roadmap #66 / #108 (control-flow follow-up): logical operators, switch, and
-- loop invariants / off-by-one reasoning.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.control_flow.logical_operators',
    'cpp',
    'cpp.control_flow',
    'Logical operators and compound conditions',
    'Combine conditions with &&, ||, and ! and rely on short-circuit evaluation.',
    'Build compound conditions and use short-circuiting to guard later operands.',
    'beginner',
    array['lesson', 'quiz'],
    7
  ),
  (
    'cpp.control_flow.switch_statement',
    'cpp',
    'cpp.control_flow',
    'switch and break',
    'Branch on a value with switch, and understand break and fallthrough.',
    'Write a switch with break per case and know what happens without break.',
    'beginner',
    array['lesson', 'quiz'],
    8
  ),
  (
    'cpp.control_flow.loop_invariants',
    'cpp',
    'cpp.control_flow',
    'Loop invariants and off-by-one',
    'Reason about what stays true each iteration and pick correct loop bounds.',
    'State a loop invariant and choose bounds that avoid off-by-one errors.',
    'intermediate',
    array['lesson', 'quiz'],
    9
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
  ('cpp.control_flow.logical_operators', 'cpp.control_flow.conditionals', 'recommended'),
  ('cpp.control_flow.switch_statement', 'cpp.control_flow.conditionals', 'recommended'),
  ('cpp.control_flow.loop_invariants', 'cpp.control_flow.loops', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
