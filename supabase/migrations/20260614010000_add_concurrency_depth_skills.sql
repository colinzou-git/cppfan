-- Roadmap #78 / #118 (concurrency depth): deadlock and lock ordering,
-- condition variables, and atomics/memory model.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.concurrency.deadlock',
    'cpp',
    'cpp.concurrency',
    'Deadlock and lock ordering',
    'Avoid deadlock by acquiring multiple locks in a consistent order.',
    'Prevent deadlock by taking locks in a fixed order or with std::scoped_lock.',
    'advanced',
    array['lesson', 'quiz'],
    754
  ),
  (
    'cpp.concurrency.condition_variables',
    'cpp',
    'cpp.concurrency',
    'Condition variables',
    'Wait for and signal state changes with std::condition_variable and a predicate.',
    'Use condition_variable::wait with a predicate to block until shared state is ready.',
    'advanced',
    array['lesson', 'quiz'],
    755
  ),
  (
    'cpp.concurrency.atomics',
    'cpp',
    'cpp.concurrency',
    'Atomics and the memory model',
    'Use std::atomic for lock-free counters and flags; know volatile is not synchronization.',
    'Use std::atomic for simple shared counters/flags and recognize its limits.',
    'advanced',
    array['lesson', 'quiz'],
    756
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
  ('cpp.concurrency.deadlock', 'cpp.concurrency.mutexes', 'recommended'),
  ('cpp.concurrency.condition_variables', 'cpp.concurrency.mutexes', 'recommended'),
  ('cpp.concurrency.atomics', 'cpp.concurrency.data_races', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
