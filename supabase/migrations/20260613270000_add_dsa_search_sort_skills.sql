-- DSA practice map expansion (#48): searching (binary search) and sorting
-- (comparators). Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.searching.binary_search',
    'dsa',
    'dsa.searching',
    'Binary search',
    'Find a target in a sorted sequence by repeatedly halving the search range.',
    'Use binary search on sorted data and explain why sorting is required.',
    'intermediate',
    array['lesson', 'quiz', 'bug_spotting'],
    1110
  ),
  (
    'dsa.sorting.comparator',
    'dsa',
    'dsa.sorting',
    'Sorting with a comparator',
    'Sort by a custom order using a comparator function or lambda.',
    'Pass a comparator to std::sort to order by a custom key or direction.',
    'intermediate',
    array['lesson', 'quiz', 'code_reading'],
    1210
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
  ('dsa.sorting.comparator', 'cpp.stl.algorithms', 'recommended'),
  ('dsa.searching.binary_search', 'dsa.sorting.comparator', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
