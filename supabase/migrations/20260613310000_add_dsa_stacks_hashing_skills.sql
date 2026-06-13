-- DSA practice map expansion (#48): stacks/queues and hashing.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'dsa.stacks.basic_stack',
    'dsa',
    'dsa.stacks',
    'Stacks and queues for problems',
    'Recognize when LIFO (stack) or FIFO (queue) structure fits a problem.',
    'Choose a stack for nested/reversible problems and a queue for level-order processing.',
    'intermediate',
    array['lesson', 'quiz', 'code_reading'],
    1310
  ),
  (
    'dsa.hashing.lookup',
    'dsa',
    'dsa.hashing',
    'Hash maps and sets for lookup',
    'Use hashing for average O(1) membership, counting, and duplicate detection.',
    'Trade memory for speed with a hash map/set instead of repeated linear scans.',
    'intermediate',
    array['lesson', 'quiz', 'code_reading'],
    1410
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
  ('dsa.stacks.basic_stack', 'cpp.stl.adapters', 'recommended'),
  ('dsa.hashing.lookup', 'cpp.stl.map', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
