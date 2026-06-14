-- Roadmap #78 / #118 (concurrency depth): learning items for deadlock/lock
-- ordering, condition variables, and atomics/memory model.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  (
    'cpp.concurrency.deadlock.lesson',
    'lesson',
    'Deadlock and lock ordering',
    'Deadlock happens when two threads each hold one lock and wait forever for the other''s: thread A locks `m1` then wants `m2`, while thread B locks `m2` then wants `m1`. Neither can proceed. The classic cure is a consistent lock order — every thread always acquires `m1` before `m2` — so the cycle of waiting can never form. C++ gives you tools so you do not have to hand-order locks: `std::scoped_lock lk(m1, m2);` (C++17) locks several mutexes at once using a deadlock-avoidance algorithm, and `std::lock(m1, m2)` does the same for pre-existing lock objects. Holding only one lock at a time, keeping critical sections short, and never calling unknown code while holding a lock also reduce the risk. Deadlock is one of the four Coffman conditions (mutual exclusion, hold-and-wait, no preemption, circular wait); breaking any one — usually circular wait via ordering — prevents it.',
    'Deadlock is a circular wait for locks held in different orders. Prevent it with a consistent global lock order, or acquire multiple locks atomically with std::scoped_lock / std::lock.',
    'advanced',
    5,
    3870,
    true
  ),
  (
    'cpp.concurrency.deadlock.mc_order',
    'multiple_choice',
    'Preventing deadlock',
    'Two threads each need to hold mutexes m1 and m2 at the same time. What reliably prevents deadlock between them?',
    'Always acquiring the mutexes in the same order (or taking both atomically with std::scoped_lock/std::lock) makes a circular wait impossible. Adding sleeps or retries does not remove the race.',
    'advanced',
    2,
    3880,
    true
  ),
  (
    'cpp.concurrency.condition_variables.lesson',
    'lesson',
    'Condition variables',
    'A condition variable lets a thread sleep until another thread signals that some shared state changed — without busy-waiting. The waiter holds a `std::unique_lock` on the mutex guarding the state and calls `cv.wait(lock, [&]{ return ready; });`; `wait` atomically releases the lock and sleeps, then re-acquires the lock and re-checks the predicate when woken. Always pass a predicate (or loop on `while (!ready) cv.wait(lock);`) because a thread can wake spuriously or after the condition was already consumed. The signalling side modifies the state under the same mutex, then calls `cv.notify_one()` (wake one waiter) or `cv.notify_all()`. This is the backbone of a producer-consumer queue: producers push an item under the lock and notify; consumers wait for the queue to be non-empty, then pop. Condition variables replace timing-based polling with deterministic hand-off.',
    'A condition variable blocks a thread until shared state changes, avoiding busy-waiting. Wait with a predicate (guards against spurious wakeups), modify state under the mutex, then notify_one/notify_all.',
    'advanced',
    5,
    3890,
    true
  ),
  (
    'cpp.concurrency.condition_variables.mc_predicate',
    'multiple_choice',
    'Why wait takes a predicate',
    'Why should condition_variable::wait be given a predicate (or be called inside a while loop checking the condition)?',
    'A waiting thread can wake spuriously or after the condition has already been handled by another thread. Re-checking a predicate ensures it only proceeds when the state is actually ready.',
    'advanced',
    2,
    3900,
    true
  ),
  (
    'cpp.concurrency.atomics.lesson',
    'lesson',
    'Atomics and the memory model',
    '`std::atomic<T>` makes individual operations on a shared value indivisible, so a `std::atomic<int>` counter incremented from many threads with `counter.fetch_add(1)` (or `++counter`) never loses updates — no mutex needed. Atomics are ideal for simple shared counters and flags (e.g. a `std::atomic<bool> stop`). But atomicity is per-operation, not per-transaction: `if (counter > 0) counter--;` is still a race because the check and the decrement are two separate atomic steps — higher-level invariants spanning multiple variables still need a mutex. Crucially, `volatile` is NOT a synchronization tool: it prevents some compiler optimizations for memory-mapped I/O but provides no atomicity and no cross-thread ordering guarantees — use `std::atomic` instead. By default atomic operations use sequentially-consistent ordering (`memory_order_seq_cst`), the easiest to reason about; relaxed/acquire-release orderings trade guarantees for speed and should be left until you truly need them.',
    'std::atomic gives indivisible per-operation access for counters/flags without a mutex; multi-step invariants still need a lock. volatile is not synchronization. Default seq_cst ordering is the safe choice.',
    'advanced',
    6,
    3910,
    true
  ),
  (
    'cpp.concurrency.atomics.mc_volatile',
    'multiple_choice',
    'volatile vs atomic',
    'A shared flag is read and written by multiple threads. Why is declaring it `volatile` not enough for correct synchronization?',
    'volatile only stops certain compiler optimizations (for memory-mapped I/O); it gives no atomicity and no cross-thread ordering guarantees. Use std::atomic for thread-safe shared access.',
    'advanced',
    2,
    3920,
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
  ('cpp.concurrency.deadlock.lesson', 'cpp.concurrency.deadlock', true),
  ('cpp.concurrency.deadlock.mc_order', 'cpp.concurrency.deadlock', true),
  ('cpp.concurrency.condition_variables.lesson', 'cpp.concurrency.condition_variables', true),
  ('cpp.concurrency.condition_variables.mc_predicate', 'cpp.concurrency.condition_variables', true),
  ('cpp.concurrency.atomics.lesson', 'cpp.concurrency.atomics', true),
  ('cpp.concurrency.atomics.mc_volatile', 'cpp.concurrency.atomics', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.concurrency.deadlock.mc_order.a', 'cpp.concurrency.deadlock.mc_order', 'Always acquire the mutexes in the same order (or take both with std::scoped_lock)', true, 10),
  ('cpp.concurrency.deadlock.mc_order.b', 'cpp.concurrency.deadlock.mc_order', 'Have each thread lock them in the opposite order', false, 20),
  ('cpp.concurrency.deadlock.mc_order.c', 'cpp.concurrency.deadlock.mc_order', 'Add a short sleep before the second lock', false, 30),
  ('cpp.concurrency.deadlock.mc_order.d', 'cpp.concurrency.deadlock.mc_order', 'Use a recursive_mutex for both', false, 40),
  ('cpp.concurrency.condition_variables.mc_predicate.a', 'cpp.concurrency.condition_variables.mc_predicate', 'A thread can wake spuriously or after the condition was already handled, so it must re-check', true, 10),
  ('cpp.concurrency.condition_variables.mc_predicate.b', 'cpp.concurrency.condition_variables.mc_predicate', 'The predicate makes wait() return faster', false, 20),
  ('cpp.concurrency.condition_variables.mc_predicate.c', 'cpp.concurrency.condition_variables.mc_predicate', 'wait() cannot compile without a predicate', false, 30),
  ('cpp.concurrency.condition_variables.mc_predicate.d', 'cpp.concurrency.condition_variables.mc_predicate', 'It avoids having to hold the mutex while waiting', false, 40),
  ('cpp.concurrency.atomics.mc_volatile.a', 'cpp.concurrency.atomics.mc_volatile', 'volatile gives no atomicity and no cross-thread ordering guarantees; use std::atomic', true, 10),
  ('cpp.concurrency.atomics.mc_volatile.b', 'cpp.concurrency.atomics.mc_volatile', 'volatile is fully equivalent to std::atomic for threads', false, 20),
  ('cpp.concurrency.atomics.mc_volatile.c', 'cpp.concurrency.atomics.mc_volatile', 'volatile makes all reads and writes use a mutex', false, 30),
  ('cpp.concurrency.atomics.mc_volatile.d', 'cpp.concurrency.atomics.mc_volatile', 'volatile only works on integer types', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
