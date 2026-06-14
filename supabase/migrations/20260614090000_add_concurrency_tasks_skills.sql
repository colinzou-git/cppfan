-- Roadmap #78 / #118 (concurrency, second slice): jthread + cooperative
-- cancellation, promises/packaged tasks, and threads-vs-tasks selection.
-- Idempotent; mirrored in src/features/skills/skill-seed.ts.

insert into public.skills (id, domain, module_id, title, description, learner_goal, level, item_types, order_index)
values
  (
    'cpp.concurrency.jthread',
    'cpp',
    'cpp.concurrency',
    'jthread and cooperative cancellation',
    'Use std::jthread for auto-joining threads that stop cooperatively via a stop_token.',
    'Start a std::jthread that checks its stop_token and request_stop() to end it cleanly.',
    'advanced',
    array['lesson', 'quiz'],
    757
  ),
  (
    'cpp.concurrency.promise_future',
    'cpp',
    'cpp.concurrency',
    'Promises and packaged tasks',
    'Hand a result from one thread to another with std::promise and std::packaged_task.',
    'Set a value through a std::promise and read it from the paired future on another thread.',
    'advanced',
    array['lesson', 'quiz'],
    758
  ),
  (
    'cpp.concurrency.task_selection',
    'cpp',
    'cpp.concurrency',
    'Choosing threads vs tasks',
    'Distinguish concurrency from parallelism and pick raw threads vs higher-level tasks.',
    'Decompose work into tasks and choose std::async/futures over manual threads when it fits.',
    'advanced',
    array['lesson', 'quiz'],
    759
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
  ('cpp.concurrency.jthread', 'cpp.concurrency.threads', 'recommended'),
  ('cpp.concurrency.promise_future', 'cpp.concurrency.async', 'recommended'),
  ('cpp.concurrency.task_selection', 'cpp.concurrency.async', 'recommended')
on conflict (skill_id, prerequisite_skill_id) do update
set relationship_type = excluded.relationship_type;
