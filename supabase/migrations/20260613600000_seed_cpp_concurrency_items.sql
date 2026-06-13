-- Roadmap #65 / #78 (stage 12): learning items for threads, data races, mutexes, async tasks.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.concurrency.threads.lesson',
    'lesson',
    'Threads',
    'A thread runs a function concurrently with the rest of the program. std::thread t(work); starts work immediately on a new thread; t.join() blocks until that thread finishes. Every std::thread must be either joined or detached before it is destroyed — otherwise its destructor calls std::terminate and the program aborts. detach() lets the thread run independently, but then you can no longer wait for it, so joining is the safe default. Threads let you overlap I/O or use multiple cores, but any data shared between threads now needs careful synchronization.',
    'A std::thread must be joined or detached before destruction or the program terminates; join() waits for the thread to finish.',
    'advanced',
    5,
    2510,
    true
  ),
  (
    'cpp.concurrency.threads.mc_join',
    'multiple_choice',
    'Joining a thread',
    'What happens if a joinable std::thread is destroyed without being joined or detached?',
    'Destroying a still-joinable std::thread calls std::terminate, aborting the program. You must join() (wait for it) or detach() (let it run free) before the thread object goes out of scope.',
    'advanced',
    2,
    2520,
    true
  ),
  (
    'cpp.concurrency.data_races.lesson',
    'lesson',
    'Data races',
    'A data race occurs when two or more threads access the same memory location concurrently, at least one of them writes, and there is no synchronization ordering the accesses. In C++ a data race is undefined behavior — the program may produce wrong results, crash, or appear to work until it does not. Even a simple counter++ is a read-modify-write that can interleave badly across threads, losing increments. The fix is to establish a happens-before ordering: protect the shared data with a mutex, or use std::atomic for simple values. Read-only sharing (no writers) is safe without synchronization.',
    'A data race is concurrent access to the same memory with at least one writer and no synchronization — undefined behavior in C++. Guard shared mutable data with a mutex or atomic.',
    'advanced',
    5,
    2530,
    true
  ),
  (
    'cpp.concurrency.data_races.mc_define',
    'multiple_choice',
    'What is a data race',
    'Which situation is a data race?',
    'A data race needs concurrent access to the same location with at least one writer and no synchronization. Multiple threads only reading shared data is not a race; writes guarded by a mutex are not a race either.',
    'advanced',
    2,
    2540,
    true
  ),
  (
    'cpp.concurrency.mutexes.lesson',
    'lesson',
    'Mutexes and locks',
    'A std::mutex enforces mutual exclusion: only one thread can hold it at a time, so the code between locking and unlocking — the critical section — runs without interference. Rather than calling lock()/unlock() by hand (and risking a leak if an exception is thrown in between), wrap it in an RAII guard: std::lock_guard<std::mutex> guard(m); locks on construction and unlocks when the guard goes out of scope. std::unique_lock is a more flexible variant that can defer locking or be unlocked early. Keep critical sections short, and always acquire multiple mutexes in a consistent order to avoid deadlock.',
    'A mutex serializes access to shared data; std::lock_guard locks it via RAII and releases it automatically, even if an exception is thrown.',
    'advanced',
    6,
    2550,
    true
  ),
  (
    'cpp.concurrency.mutexes.mc_lock_guard',
    'multiple_choice',
    'Why use lock_guard',
    'What is the main advantage of std::lock_guard over manual mutex lock()/unlock() calls?',
    'std::lock_guard releases the mutex in its destructor, so the lock is freed even if the critical section throws or returns early — avoiding the leaked-lock and deadlock bugs that manual unlock() invites.',
    'advanced',
    2,
    2560,
    true
  ),
  (
    'cpp.concurrency.async.lesson',
    'lesson',
    'Async tasks and futures',
    'std::async runs a function and hands you a std::future that will eventually hold its result. Calling fut.get() blocks until the task finishes and returns the value (or rethrows an exception it threw). With the std::launch::async policy the task runs on a new thread; the default policy may instead run it lazily when you call get(). Futures are a higher-level alternative to managing threads by hand: no manual join, and results and exceptions flow back to you cleanly. Note that get() may only be called once per future.',
    'std::async returns a future; future::get() blocks until the result is ready and returns it (or rethrows). It is a higher-level alternative to manual thread management.',
    'advanced',
    5,
    2570,
    true
  ),
  (
    'cpp.concurrency.async.mc_get',
    'multiple_choice',
    'Getting an async result',
    'What does calling get() on the std::future returned by std::async do?',
    'future::get() blocks until the async task has finished, then returns its result (or rethrows any exception the task threw). It can only be called once.',
    'advanced',
    2,
    2580,
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
  ('cpp.concurrency.threads.lesson', 'cpp.concurrency.threads', true),
  ('cpp.concurrency.threads.mc_join', 'cpp.concurrency.threads', true),
  ('cpp.concurrency.data_races.lesson', 'cpp.concurrency.data_races', true),
  ('cpp.concurrency.data_races.mc_define', 'cpp.concurrency.data_races', true),
  ('cpp.concurrency.mutexes.lesson', 'cpp.concurrency.mutexes', true),
  ('cpp.concurrency.mutexes.mc_lock_guard', 'cpp.concurrency.mutexes', true),
  ('cpp.concurrency.async.lesson', 'cpp.concurrency.async', true),
  ('cpp.concurrency.async.mc_get', 'cpp.concurrency.async', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.concurrency.threads.mc_join.a', 'cpp.concurrency.threads.mc_join', 'The program calls std::terminate and aborts', true, 10),
  ('cpp.concurrency.threads.mc_join.b', 'cpp.concurrency.threads.mc_join', 'The thread is silently joined for you', false, 20),
  ('cpp.concurrency.threads.mc_join.c', 'cpp.concurrency.threads.mc_join', 'The thread keeps running with no consequences', false, 30),
  ('cpp.concurrency.threads.mc_join.d', 'cpp.concurrency.threads.mc_join', 'The compiler rejects the program', false, 40),
  ('cpp.concurrency.data_races.mc_define.a', 'cpp.concurrency.data_races.mc_define', 'Two threads access the same variable concurrently and at least one writes, with no synchronization', true, 10),
  ('cpp.concurrency.data_races.mc_define.b', 'cpp.concurrency.data_races.mc_define', 'Several threads only read the same shared constant', false, 20),
  ('cpp.concurrency.data_races.mc_define.c', 'cpp.concurrency.data_races.mc_define', 'One thread writes a variable that no other thread touches', false, 30),
  ('cpp.concurrency.data_races.mc_define.d', 'cpp.concurrency.data_races.mc_define', 'Threads write shared data while holding the same mutex', false, 40),
  ('cpp.concurrency.mutexes.mc_lock_guard.a', 'cpp.concurrency.mutexes.mc_lock_guard', 'It releases the mutex automatically, even if the critical section throws', true, 10),
  ('cpp.concurrency.mutexes.mc_lock_guard.b', 'cpp.concurrency.mutexes.mc_lock_guard', 'It makes the mutex faster to lock', false, 20),
  ('cpp.concurrency.mutexes.mc_lock_guard.c', 'cpp.concurrency.mutexes.mc_lock_guard', 'It allows many threads to hold the mutex at once', false, 30),
  ('cpp.concurrency.mutexes.mc_lock_guard.d', 'cpp.concurrency.mutexes.mc_lock_guard', 'It removes the need for a mutex entirely', false, 40),
  ('cpp.concurrency.async.mc_get.a', 'cpp.concurrency.async.mc_get', 'Blocks until the task finishes, then returns its result or rethrows its exception', true, 10),
  ('cpp.concurrency.async.mc_get.b', 'cpp.concurrency.async.mc_get', 'Cancels the task immediately', false, 20),
  ('cpp.concurrency.async.mc_get.c', 'cpp.concurrency.async.mc_get', 'Returns a default value without waiting', false, 30),
  ('cpp.concurrency.async.mc_get.d', 'cpp.concurrency.async.mc_get', 'Starts a brand-new thread each time it is called', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
