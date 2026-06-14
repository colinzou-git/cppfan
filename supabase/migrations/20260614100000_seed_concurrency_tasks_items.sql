-- Roadmap #78 / #118 (concurrency, second slice): learning items for jthread +
-- cooperative cancellation, promises/packaged tasks, and threads-vs-tasks.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.concurrency.jthread.lesson',
    'lesson',
    'jthread and cooperative cancellation',
    '`std::jthread` (C++20) fixes two sharp edges of `std::thread`. First, it joins automatically in its destructor, so you can no longer forget to join and crash the program — it is RAII for threads. Second, it has built-in cooperative cancellation: a `jthread` carries a `std::stop_source`, and if your thread function takes a `std::stop_token` as its first parameter, the runtime passes it in. Your loop checks `while (!token.stop_requested()) { ... }`, and another thread calls `jt.request_stop()` (or the destructor calls it for you) to ask it to finish. Cancellation is *cooperative*: there is no way to forcibly kill a running thread in C++, so the worker must poll the token (or use `std::condition_variable_any::wait` overloads that take a stop_token to wake on a stop request). The pattern: long-running workers take a stop_token, check it at safe points, and exit their loop when a stop is requested — clean shutdown with no detached-thread leaks or abrupt termination.',
    'std::jthread auto-joins in its destructor (RAII) and supports cooperative cancellation: the worker takes a std::stop_token and polls stop_requested(); another thread calls request_stop(). C++ cannot forcibly kill a thread, so the worker must check the token.',
    'advanced',
    6,
    4110,
    true
  ),
  (
    'cpp.concurrency.jthread.mc_stop',
    'multiple_choice',
    'How jthread cancellation works',
    'How does a std::jthread worker get cancelled when another thread calls request_stop()?',
    'Cancellation is cooperative: request_stop() sets the shared stop state, and the worker must poll its std::stop_token (stop_requested()) and exit on its own. C++ cannot forcibly terminate a running thread.',
    'advanced',
    2,
    4120,
    true
  ),
  (
    'cpp.concurrency.promise_future.lesson',
    'lesson',
    'Promises and packaged tasks',
    '`std::async` is the easy button, but sometimes you need to hand a result across threads more explicitly. A `std::promise<T>` is the producing end of a one-shot channel and its paired `std::future<T>` (from `promise.get_future()`) is the consuming end: one thread calls `promise.set_value(x)` (or `set_exception(...)`), and whatever thread holds the future blocks on `future.get()` until the value arrives. This decouples *who computes* from *who started the work* — useful when the producer is an existing thread, a callback, or an event handler rather than a function you launch. `std::packaged_task<R(Args...)>` wraps a callable so that invoking it stores its return value into an associated future; you hand the task to a thread or a thread pool and keep the future. Rule of thumb: reach for `std::async` for fire-and-forget compute, `packaged_task` to schedule callables on your own threads/pool, and a bare `promise` when the result is produced by code you do not call directly. Each future result can be retrieved only once.',
    'std::promise/std::future form a one-shot cross-thread channel: producer calls set_value/set_exception, consumer blocks on future.get(). std::packaged_task wraps a callable to feed a future. Use async for fire-and-forget, packaged_task for your own threads/pool, promise when another agent produces the value.',
    'advanced',
    6,
    4130,
    true
  ),
  (
    'cpp.concurrency.promise_future.mc_promise',
    'multiple_choice',
    'Delivering a value through a promise',
    'One thread holds a std::promise<int> and another holds the paired std::future<int>. How does the value get from producer to consumer?',
    'The producer calls promise.set_value(x); the consumer''s future.get() blocks until then and returns x. The promise and future are the two ends of a single one-shot channel created by promise.get_future().',
    'advanced',
    2,
    4140,
    true
  ),
  (
    'cpp.concurrency.task_selection.lesson',
    'lesson',
    'Choosing threads vs tasks',
    'Concurrency and parallelism are different goals. Concurrency is structuring a program as independent tasks that can make progress in overlapping time windows (e.g. handling many connections), and it helps even on one core — especially for I/O-bound work that spends time waiting. Parallelism is actually running computations at the same instant on multiple cores to go faster, which only helps CPU-bound work and only up to the core count. Pick your tool accordingly. Higher-level *tasks* — `std::async`, futures, `packaged_task`, or a thread pool — let you express "compute this, give me the result later" without owning thread lifetimes, handle exceptions through the future, and avoid oversubscription; prefer them for request/response compute and divide-and-conquer work. Drop to a raw `std::thread`/`std::jthread` when you need a long-lived dedicated thread (an event loop, a background poller) or fine control over the thread itself. And remember Amdahl''s law: the serial fraction caps your speedup, so more threads is not automatically faster — measure, and watch for contention and the cost of synchronization.',
    'Concurrency = overlapping independent tasks (helps I/O-bound work, even on one core); parallelism = simultaneous execution on multiple cores (helps CPU-bound work). Prefer high-level tasks (async/futures/pool) for compute-and-return work; use raw threads for long-lived dedicated work. Amdahl''s law caps speedup.',
    'advanced',
    6,
    4150,
    true
  ),
  (
    'cpp.concurrency.task_selection.mc_concurrency',
    'multiple_choice',
    'Concurrency vs parallelism',
    'A program is I/O-bound (it mostly waits on network responses) and runs on a single core. Which idea most directly helps it?',
    'Concurrency — overlapping independent tasks so one can progress while another waits — helps I/O-bound work even on a single core. Parallelism (simultaneous execution on multiple cores) only speeds up CPU-bound work and needs more than one core.',
    'advanced',
    2,
    4160,
    true
  )
on conflict (id) do update
set
  type = excluded.type,
  title = excluded.title,
  prompt = excluded.prompt,
  explanation = excluded.explanation,
  difficulty = excluded.difficulty,
  estimated_minutes = excluded.estimated_minutes,
  order_index = excluded.order_index,
  is_active = true,
  updated_at = now();

insert into public.learning_item_skills (learning_item_id, skill_id, is_primary)
values
  ('cpp.concurrency.jthread.lesson', 'cpp.concurrency.jthread', true),
  ('cpp.concurrency.jthread.mc_stop', 'cpp.concurrency.jthread', true),
  ('cpp.concurrency.promise_future.lesson', 'cpp.concurrency.promise_future', true),
  ('cpp.concurrency.promise_future.mc_promise', 'cpp.concurrency.promise_future', true),
  ('cpp.concurrency.task_selection.lesson', 'cpp.concurrency.task_selection', true),
  ('cpp.concurrency.task_selection.mc_concurrency', 'cpp.concurrency.task_selection', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.concurrency.jthread.mc_stop.a', 'cpp.concurrency.jthread.mc_stop', 'The worker polls its stop_token (stop_requested()) and exits on its own; cancellation is cooperative', true, 10),
  ('cpp.concurrency.jthread.mc_stop.b', 'cpp.concurrency.jthread.mc_stop', 'request_stop() forcibly terminates the running thread immediately', false, 20),
  ('cpp.concurrency.jthread.mc_stop.c', 'cpp.concurrency.jthread.mc_stop', 'The operating system kills the thread and reclaims its stack', false, 30),
  ('cpp.concurrency.jthread.mc_stop.d', 'cpp.concurrency.jthread.mc_stop', 'It throws an exception inside the worker to unwind it', false, 40),
  ('cpp.concurrency.promise_future.mc_promise.a', 'cpp.concurrency.promise_future.mc_promise', 'The producer calls promise.set_value(x); the consumer''s future.get() blocks until then and returns x', true, 10),
  ('cpp.concurrency.promise_future.mc_promise.b', 'cpp.concurrency.promise_future.mc_promise', 'The consumer reads the value directly out of the promise object', false, 20),
  ('cpp.concurrency.promise_future.mc_promise.c', 'cpp.concurrency.promise_future.mc_promise', 'The value is copied automatically when the producer thread joins', false, 30),
  ('cpp.concurrency.promise_future.mc_promise.d', 'cpp.concurrency.promise_future.mc_promise', 'A shared global variable must be used; promise/future cannot pass values', false, 40),
  ('cpp.concurrency.task_selection.mc_concurrency.a', 'cpp.concurrency.task_selection.mc_concurrency', 'Concurrency: overlap independent tasks so one progresses while another waits', true, 10),
  ('cpp.concurrency.task_selection.mc_concurrency.b', 'cpp.concurrency.task_selection.mc_concurrency', 'Parallelism: run the work simultaneously on many cores', false, 20),
  ('cpp.concurrency.task_selection.mc_concurrency.c', 'cpp.concurrency.task_selection.mc_concurrency', 'Adding more CPU cores', false, 30),
  ('cpp.concurrency.task_selection.mc_concurrency.d', 'cpp.concurrency.task_selection.mc_concurrency', 'Vectorizing the inner compute loop', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
