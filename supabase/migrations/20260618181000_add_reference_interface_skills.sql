-- Roadmap #67 / #109 (function-interface design): parameter intent,
-- return-vs-output, optional results, overloads/defaults, and API choices.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.references.interface_intent',
    'cpp',
    'cpp.references',
    'Function interface intent',
    'Read and design signatures that communicate input, output, in-out, ownership, and mutation intent.',
    'Choose return values, value/reference/view parameters, and non-owning pointers based on what a function promises to do.',
    'intermediate',
    array['lesson', 'quiz', 'bug_spotting'],
    100
  ),
  (
    'cpp.references.optional_overloads',
    'cpp',
    'cpp.references',
    'Optional results, overloads, and defaults',
    'Use std::optional for absence and design overload/default-argument sets without ambiguity.',
    'Return optional for maybe-values, use default arguments for simple defaults, and overload only for genuinely different input shapes.',
    'intermediate',
    array['lesson', 'quiz'],
    101
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
  ('cpp.references.interface_intent', 'cpp.references.parameter_passing', 'recommended'),
  ('cpp.references.interface_intent', 'cpp.references.views', 'recommended'),
  ('cpp.references.optional_overloads', 'cpp.references.interface_intent', 'recommended'),
  ('cpp.raii.ownership_boundary', 'cpp.references.non_owning', 'recommended'),
  ('cpp.smart_pointers.ownership_choice', 'cpp.references.interface_intent', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
