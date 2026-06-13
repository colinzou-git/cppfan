-- Roadmap #66 / #108 (program-basics follow-up): statements/comments/naming,
-- main() exit status, and compile/link/run-time error kinds.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.program_basics.statements_comments',
    'cpp',
    'cpp.program_basics',
    'Statements, comments, and naming',
    'Terminate statements, write comments, and follow common naming conventions.',
    'Write well-formed statements with clear comments and conventional names.',
    'beginner',
    array['lesson', 'quiz'],
    3
  ),
  (
    'cpp.program_basics.exit_status',
    'cpp',
    'cpp.program_basics',
    'main() return value and exit status',
    'Understand what main()''s return value means as the program''s exit status.',
    'Explain that returning 0 from main() signals success to the operating system.',
    'beginner',
    array['lesson', 'quiz'],
    4
  ),
  (
    'cpp.program_basics.error_kinds',
    'cpp',
    'cpp.program_basics',
    'Compile-time, link-time, and run-time errors',
    'Tell apart errors caught by the compiler, the linker, and at run time.',
    'Classify a failure as a compile-time, link-time, or run-time error.',
    'beginner',
    array['lesson', 'quiz'],
    5
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
  ('cpp.program_basics.statements_comments', 'cpp.program_basics.structure', 'recommended'),
  ('cpp.program_basics.exit_status', 'cpp.program_basics.structure', 'recommended'),
  ('cpp.program_basics.error_kinds', 'cpp.program_basics.statements_comments', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
