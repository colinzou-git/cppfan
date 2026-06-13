-- Roadmap #65 / #66: C++ foundations (stage 1) — program basics and values/types.
-- These sit before structs/classes in the path. Idempotent; mirrored in
-- src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.program_basics.structure',
    'cpp',
    'cpp.program_basics',
    'Program structure and main()',
    'Read a minimal program: includes, main(), statements, and return values.',
    'Explain where a program starts and what main()''s return value means.',
    'beginner',
    array['lesson', 'quiz'],
    1
  ),
  (
    'cpp.program_basics.io',
    'cpp',
    'cpp.program_basics',
    'Console input and output',
    'Print with std::cout and read with std::cin.',
    'Write output and read input using the iostream operators.',
    'beginner',
    array['lesson', 'quiz'],
    2
  ),
  (
    'cpp.values_types.variables',
    'cpp',
    'cpp.values_types',
    'Variables, types, and initialization',
    'Declare and initialize variables of the fundamental types.',
    'Choose a fundamental type, initialize on declaration, and use auto/const.',
    'beginner',
    array['lesson', 'quiz'],
    3
  ),
  (
    'cpp.values_types.conversions',
    'cpp',
    'cpp.values_types',
    'Conversions and casts',
    'Understand truncation, narrowing, and static_cast.',
    'Predict the result of a numeric conversion and cast explicitly with static_cast.',
    'beginner',
    array['lesson', 'quiz', 'bug_spotting'],
    4
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
  ('cpp.program_basics.io', 'cpp.program_basics.structure', 'recommended'),
  ('cpp.values_types.variables', 'cpp.program_basics.structure', 'recommended'),
  ('cpp.values_types.conversions', 'cpp.values_types.variables', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
