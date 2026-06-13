-- Roadmap #65 / #78 (stage 12): concurrency — threads, data races, mutexes, async tasks.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.concurrency.threads',
    'cpp',
    'cpp.concurrency',
    'Threads',
    'Run work concurrently with std::thread and join or detach it.',
    'Start a std::thread and join it before its work is needed or the program ends.',
    'advanced',
    array['lesson', 'quiz'],
    750
  ),
  (
    'cpp.concurrency.data_races',
    'cpp',
    'cpp.concurrency',
    'Data races',
    'Recognize undefined behavior from unsynchronized shared mutable state.',
    'Identify a data race: concurrent access to shared data with at least one writer.',
    'advanced',
    array['lesson', 'quiz'],
    751
  ),
  (
    'cpp.concurrency.mutexes',
    'cpp',
    'cpp.concurrency',
    'Mutexes and locks',
    'Protect shared data with std::mutex and RAII lock guards.',
    'Use std::lock_guard to hold a mutex for the duration of a critical section.',
    'advanced',
    array['lesson', 'quiz'],
    752
  ),
  (
    'cpp.concurrency.async',
    'cpp',
    'cpp.concurrency',
    'Async tasks and futures',
    'Run a task with std::async and collect its result through a future.',
    'Launch work with std::async and retrieve the result via future::get.',
    'advanced',
    array['lesson', 'quiz'],
    753
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
  ('cpp.concurrency.threads', 'cpp.functions.basics', 'recommended'),
  ('cpp.concurrency.data_races', 'cpp.concurrency.threads', 'recommended'),
  ('cpp.concurrency.mutexes', 'cpp.concurrency.data_races', 'recommended'),
  ('cpp.concurrency.async', 'cpp.concurrency.threads', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
