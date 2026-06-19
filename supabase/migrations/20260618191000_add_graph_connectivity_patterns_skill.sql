-- Roadmap #75 / #115 final graph phase: offline connectivity and graph cuts.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (
  id,
  domain,
  module_id,
  title,
  description,
  learner_goal,
  level,
  item_types,
  order_index,
  is_active
)
values
  (
    'dsa.graphs.connectivity_patterns',
    'dsa',
    'dsa.graphs',
    'Offline connectivity and graph cuts',
    'Use DSU for offline connectivity and recognize bridges and articulation points.',
    'Process offline connectivity queries in reverse and identify when bridges/articulation points matter.',
    'advanced',
    array['lesson', 'quiz'],
    1810,
    true
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
  ('dsa.graphs.connectivity_patterns', 'dsa.graphs.connected_components', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
