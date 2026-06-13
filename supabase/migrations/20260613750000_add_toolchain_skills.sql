-- Roadmap #71 / #113 (tooling follow-up): warnings-as-errors, sanitizers, CMake.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.tooling.warnings',
    'cpp',
    'cpp.tooling',
    'Warnings and warnings-as-errors',
    'Enable strong warnings and treat them as build-failing signals.',
    'Build with -Wall -Wextra and explain why -Werror keeps warnings from piling up.',
    'intermediate',
    array['lesson', 'quiz'],
    705
  ),
  (
    'cpp.tooling.sanitizers',
    'cpp',
    'cpp.tooling',
    'Address and UB sanitizers',
    'Catch memory and undefined-behavior bugs at run time with ASan/UBSan.',
    'Build with -fsanitize=address,undefined to surface UB and memory errors in tests.',
    'advanced',
    array['lesson', 'quiz'],
    706
  ),
  (
    'cpp.tooling.cmake',
    'cpp',
    'cpp.tooling',
    'CMake builds',
    'Define targets and link dependencies; choose Debug vs Release.',
    'Read a small CMakeLists with a target plus includes/links and pick a build type.',
    'intermediate',
    array['lesson', 'quiz'],
    707
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
  ('cpp.tooling.warnings', 'cpp.tooling.build', 'recommended'),
  ('cpp.tooling.sanitizers', 'cpp.tooling.debugging', 'recommended'),
  ('cpp.tooling.cmake', 'cpp.tooling.build', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
