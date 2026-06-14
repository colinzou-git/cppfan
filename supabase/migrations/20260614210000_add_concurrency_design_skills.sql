-- Roadmap #78 / #118 (concurrency, third slice): memory ordering and
-- happens-before, lock granularity, and minimizing shared mutable state.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.concurrency.memory_ordering',
    'cpp',
    'cpp.concurrency',
    'Memory ordering and happens-before',
    'Understand acquire-release pairing and when relaxed ordering is safe.',
    'Explain release-acquire happens-before and pick an ordering weaker than seq_cst safely.',
    'advanced',
    array['lesson', 'quiz'],
    760
  ),
  (
    'cpp.concurrency.lock_granularity',
    'cpp',
    'cpp.concurrency',
    'Lock granularity',
    'Trade off coarse vs fine-grained locking and use shared_mutex for read-heavy data.',
    'Hold locks briefly, choose lock granularity, and use shared_mutex for many readers.',
    'advanced',
    array['lesson', 'quiz'],
    761
  ),
  (
    'cpp.concurrency.shared_state_design',
    'cpp',
    'cpp.concurrency',
    'Minimizing shared mutable state',
    'Avoid races by design: confine state, pass messages, and share immutable data.',
    'Reduce shared writable state via confinement, message passing, and immutability.',
    'advanced',
    array['lesson', 'quiz'],
    762
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
  ('cpp.concurrency.memory_ordering', 'cpp.concurrency.atomics', 'recommended'),
  ('cpp.concurrency.lock_granularity', 'cpp.concurrency.mutexes', 'recommended'),
  ('cpp.concurrency.shared_state_design', 'cpp.concurrency.data_races', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
