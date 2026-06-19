-- Roadmap #71 / #113 final coverage: formatting and static-analysis overview.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.tooling.format_static_analysis',
    'cpp',
    'cpp.tooling',
    'Formatting and static analysis',
    'Use automated formatting and static analysis as fast feedback before review.',
    'Format code consistently and use static analysis to catch likely defects beyond compiler warnings.',
    'intermediate',
    array['lesson', 'quiz'],
    714
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
  ('cpp.tooling.format_static_analysis', 'cpp.tooling.warnings', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
