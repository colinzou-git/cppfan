-- Roadmap #70 / #112 (templates depth): concepts in depth, ranges algorithms +
-- lazy views, and view lifetime / dangling.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.templates.concepts_depth',
    'cpp',
    'cpp.templates',
    'Concepts in depth',
    'Constrain templates with standard concepts and requires, for clearer intent and errors.',
    'Use std::integral and a requires clause (or an abbreviated template) to constrain a template and improve diagnostics.',
    'advanced',
    array['lesson', 'quiz'],
    611
  ),
  (
    'cpp.templates.ranges_depth',
    'cpp',
    'cpp.templates',
    'Ranges algorithms and lazy views',
    'Call std::ranges algorithms on whole ranges and compose lazy filter/transform/take views.',
    'Replace iterator-pair calls with std::ranges algorithms and build a lazy view pipeline.',
    'advanced',
    array['lesson', 'quiz'],
    612
  ),
  (
    'cpp.templates.view_lifetime',
    'cpp',
    'cpp.templates',
    'View lifetime and dangling',
    'Views do not own their elements; avoid returning a view over a temporary or destroyed container.',
    'Explain why a view can dangle and materialize results when the source will not outlive the view.',
    'advanced',
    array['lesson', 'quiz'],
    613
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
  ('cpp.templates.concepts_depth', 'cpp.templates.concepts', 'recommended'),
  ('cpp.templates.ranges_depth', 'cpp.templates.ranges', 'recommended'),
  ('cpp.templates.view_lifetime', 'cpp.templates.ranges', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
