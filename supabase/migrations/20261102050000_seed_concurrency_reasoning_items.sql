-- #704: deterministic concurrency reasoning depth.
-- Adds two choice-backed reasoning items per existing concurrency skill.
-- Idempotent; mirrored in src/features/learning-items/learning-item-seed.ts.

insert into public.learning_items (id, type, title, prompt, explanation, difficulty, estimated_minutes, order_index, is_active)
values
  ('cpp.concurrency.threads.reasoning_join_trace', 'code_reading', 'Trace join ownership', 'A main thread starts T1, reaches `t.join()` while T1 is still running, T1 finishes, and then `join()` returns. What guarantee does `join()` provide at the point main continues?', '`join()` blocks until the owned thread has finished. After it returns, that `std::thread` is no longer joinable and the worker cannot still be accessing state through that thread execution.', 'advanced', 3, 6010, true),
  ('cpp.concurrency.threads.reasoning_dangling_capture', 'bug_spotting', 'Spot a worker lifetime bug', 'Spot the bug:

```cpp
std::thread make_worker() {
  std::string label = "ready";
  return std::thread([&] { log(label); });
}
```

The returned thread can keep running after `make_worker` returns.', 'The lambda captures the local `label` by reference, but `label` is destroyed when `make_worker` returns. The worker may dereference a dangling reference. Give the worker owned data (capture by value/move) or keep the referenced object alive until the thread is joined.', 'advanced', 4, 6020, true),
  ('cpp.concurrency.data_races.reasoning_lost_update', 'code_reading', 'Trace a lost increment', 'Assume `counter` starts at 0 and two unsynchronized `counter++` operations interleave as these explicit steps:

```text
T1 reads counter -> 0
T2 reads counter -> 0
T1 writes 1
T2 writes 1
```

What final value does this trace produce, and what does it demonstrate?', 'This trace finishes at 1, not 2: both increments used the same stale read, so one update was lost. In actual C++, the unsynchronized conflicting accesses are a data race and therefore undefined behavior; the trace is a teaching interleaving, not a guarantee of one runtime outcome.', 'advanced', 3, 6030, true),
  ('cpp.concurrency.data_races.reasoning_plain_flag', 'bug_spotting', 'Spot the unsynchronized flag', 'Spot the concurrency defect:

```cpp
bool ready = false;
std::thread writer([&] { ready = true; });
std::thread reader([&] { while (!ready) { /* work */ } });
```', 'A plain `bool` is not synchronization. One thread writes `ready` while another reads it without a happens-before relationship, which is a data race. Use an atomic flag for this simple state, or protect the state with a mutex/condition variable if the predicate spans more data.', 'advanced', 4, 6040, true),
  ('cpp.concurrency.mutexes.reasoning_multi_field_invariant', 'code_reading', 'Protect a multi-field invariant', 'A statistics object requires `total == sum of all recorded amounts`. One thread executes:

```cpp
{
  std::lock_guard lock(m);
  ++count;
}
total += amount;
```

Other threads read `count` and `total` while holding `m`. What is wrong with this lock scope?', 'The invariant spans both fields, but `total` is modified after releasing the mutex. Readers can observe a new `count` with an old `total`, and the write to `total` can race. Protect the entire invariant update with the same mutex.', 'advanced', 3, 6050, true),
  ('cpp.concurrency.mutexes.reasoning_manual_unlock', 'bug_spotting', 'Spot a leaked mutex', 'Spot the bug:

```cpp
m.lock();
if (!valid(input)) {
  return;
}
update_shared_state();
m.unlock();
```', 'The early return skips `unlock()`, leaving the mutex locked and potentially blocking every future caller. Use RAII (`std::lock_guard` or `std::unique_lock`) so every exit path releases the mutex automatically.', 'advanced', 4, 6060, true),
  ('cpp.concurrency.async.reasoning_exception_get', 'code_reading', 'Trace an async exception', 'Read this code:

```cpp
auto f = std::async(std::launch::async, []() -> int {
  throw std::runtime_error("bad input");
});
int value = f.get();
```

Where does the exception become observable?', 'The asynchronous task stores the exception in the shared state. `future::get()` waits for completion and rethrows that exception in the calling thread, so normal exception handling can surround `get()`.', 'advanced', 3, 6070, true),
  ('cpp.concurrency.async.reasoning_default_policy', 'bug_spotting', 'Do not assume eager async execution', 'A program calls `std::async(do_work)` and then performs other work assuming `do_work` is already running in parallel. What assumption is unsafe?', 'Without an explicit launch policy, the implementation may choose deferred execution, meaning the callable can run only when the future is waited on or queried. If the design requires eager asynchronous execution, request `std::launch::async` explicitly.', 'advanced', 4, 6080, true),
  ('cpp.concurrency.deadlock.reasoning_wait_cycle', 'code_reading', 'Trace a two-lock deadlock', 'Trace this explicitly ordered state:

```text
T1 locks A
T2 locks B
T1 requests B -> blocked
T2 requests A -> blocked
```

Why can neither thread make progress?', 'T1 holds A while waiting for B, and T2 holds B while waiting for A. That circular wait cannot resolve by itself. A consistent global lock order or a deadlock-avoiding multi-lock operation removes the cycle.', 'advanced', 3, 6090, true),
  ('cpp.concurrency.deadlock.reasoning_scoped_lock', 'bug_spotting', 'Repair opposite lock ordering', 'Two transfer functions lock account mutexes in opposite orders (`from` then `to` in one path, `to` then `from` in another). What is the safest direct repair when both locks are needed together?', 'Acquire both mutexes with `std::scoped_lock(from.m, to.m)` (or enforce one global ordering everywhere). The important property is eliminating inconsistent nested acquisition that can form a circular wait.', 'advanced', 4, 6100, true),
  ('cpp.concurrency.condition_variables.reasoning_predicate_trace', 'code_reading', 'Trace a predicate wait', 'A consumer holds `m` and executes `cv.wait(lock, [&] { return ready; });`. The wait releases `m`, the producer sets `ready = true` while holding `m`, unlocks, and notifies. What must the consumer do before returning from `wait`?', 'The waiting operation re-acquires the mutex and checks the predicate again before it returns. Rechecking is essential because wakes can be spurious or another thread may have changed/consumed the state before this waiter reacquires the lock.', 'advanced', 3, 6110, true),
  ('cpp.concurrency.condition_variables.reasoning_shutdown_notify', 'bug_spotting', 'Wake every waiter on shutdown', 'Three consumers wait on the predicate `shutdown || !queue.empty()`. The shutdown path sets `shutdown = true` under the mutex and then calls only `cv.notify_one()`. What is the bug?', 'Shutdown makes the predicate true for every blocked consumer, so all of them must get a chance to wake and exit. `notify_one()` can leave other consumers asleep forever; the shutdown transition should normally use `notify_all()` after updating the protected state.', 'advanced', 4, 6120, true),
  ('cpp.concurrency.atomics.reasoning_compound_check', 'code_reading', 'Atomic operations do not make a transaction', 'Suppose `tickets` is `std::atomic<int>` and two threads execute:

```cpp
if (tickets.load() > 0) {
  tickets.fetch_sub(1);
}
```

Why can this still violate the invariant that tickets never goes below zero?', 'Each atomic operation is indivisible, but the check and decrement are separate operations. Two threads can both observe 1 and both decrement. Use a compare-exchange loop or a mutex when the invariant is a multi-step transaction.', 'advanced', 3, 6130, true),
  ('cpp.concurrency.atomics.reasoning_volatile_stop', 'bug_spotting', 'Do not synchronize with volatile', 'A worker loop polls `volatile bool stop` while another thread writes `stop = true`. What is the concurrency defect?', '`volatile` does not provide atomicity or inter-thread ordering in C++. The read and write still form a data race. For a standalone stop flag, use `std::atomic<bool>` (or a higher-level cancellation mechanism such as `std::stop_token`).', 'advanced', 4, 6140, true),
  ('cpp.concurrency.jthread.reasoning_stop_trace', 'code_reading', 'Trace cooperative cancellation', 'A `std::jthread` worker loops while `!token.stop_requested()`. The owner calls `request_stop()`, the worker reaches its next check, exits the loop, and returns. What makes this cancellation safe?', 'The owner requests cancellation but does not kill the thread asynchronously. The worker observes the shared stop state at a safe point and returns normally, so its cleanup and invariants remain under program control; `jthread` then joins through RAII.', 'advanced', 3, 6150, true),
  ('cpp.concurrency.jthread.reasoning_blocked_wait', 'bug_spotting', 'A stop request must wake blocked work', 'A `jthread` checks its `stop_token` only at the top of a loop, then can block indefinitely in a condition-variable wait whose predicate is only `!queue.empty()`. The owner calls `request_stop()` while the queue is empty. What can go wrong?', 'The worker may never return to the top of the loop to observe the stop request. Design the blocking wait to react to cancellation too—for example a stop-token-aware wait, or a shutdown predicate plus notification—so a blocked worker can wake and exit.', 'advanced', 4, 6160, true),
  ('cpp.concurrency.promise_future.reasoning_exception_channel', 'code_reading', 'Deliver an exception through a future', 'A producer catches an exception and calls `promise.set_exception(std::current_exception())`. What happens when the consumer later calls the paired `future.get()`?', 'The future''s shared state stores the exception. `get()` rethrows it in the consumer thread, allowing the result channel to carry either a value or failure without a separate shared error variable.', 'advanced', 3, 6170, true),
  ('cpp.concurrency.promise_future.reasoning_get_twice', 'bug_spotting', 'A future is a one-shot result', 'Spot the misuse:

```cpp
auto f = promise.get_future();
int first = f.get();
int second = f.get();
```', 'A `std::future` result is consumed by `get()` and may be retrieved only once. If multiple reads/consumers are required, convert to `std::shared_future` before consuming the result or redesign the ownership of the result.', 'advanced', 4, 6180, true),
  ('cpp.concurrency.task_selection.reasoning_io_concurrency', 'code_reading', 'Choose concurrency for waiting work', 'A server has many independent requests that mostly wait for network I/O and it currently runs on one CPU core. Why can a concurrent task design still improve responsiveness?', 'Concurrency lets another task make progress while one request is waiting, even when only one CPU core executes instructions at a time. This is different from CPU parallelism, which needs simultaneous execution on multiple cores to accelerate compute-heavy work.', 'advanced', 3, 6190, true),
  ('cpp.concurrency.task_selection.reasoning_detached_poller', 'bug_spotting', 'Own a long-lived background worker', 'A component starts a detached raw thread that polls a device forever and captures `this`. The component can be destroyed while the thread is still running. What design better matches the job?', 'A long-lived background worker needs explicit lifetime ownership and shutdown. An owned `std::jthread` (or another managed worker abstraction) lets the component request cancellation and join during destruction instead of leaving detached work touching dead state.', 'advanced', 4, 6200, true),
  ('cpp.concurrency.memory_ordering.reasoning_release_acquire', 'code_reading', 'Trace release/acquire publication', 'Producer: `data = 42; ready.store(true, std::memory_order_release);` Consumer: it reads `true` from `ready.load(std::memory_order_acquire)` and then reads `data`. What relationship makes the read of `data` valid?', 'The release store publishes prior writes, and the acquire load that reads that released value synchronizes with it. That creates a happens-before edge from the producer''s earlier `data = 42` to the consumer''s subsequent read.', 'advanced', 3, 6210, true),
  ('cpp.concurrency.memory_ordering.reasoning_relaxed_publish', 'bug_spotting', 'Relaxed ordering cannot publish unrelated data', 'Producer writes ordinary non-atomic payload fields and then stores `ready = true` with `memory_order_relaxed`. Consumer waits until a relaxed load sees true and then reads the payload. What guarantee is missing?', 'Relaxed operations make the flag itself atomic but establish no ordering for the ordinary payload writes. Use an appropriate release/acquire publication edge (or a mutex). Relaxed ordering is suitable for independent telemetry counters where no other memory is gated by the value.', 'advanced', 4, 6220, true),
  ('cpp.concurrency.lock_granularity.reasoning_short_critical_section', 'code_reading', 'Keep independent work outside the lock', 'A function locks `m`, copies one shared record into a local value, formats a large report from that local copy, performs a slow external write, and then unlocks. Which part should normally remain inside the critical section?', 'Only the access needed to obtain a consistent shared-state snapshot needs the mutex. Formatting and external I/O on an owned local copy should happen after unlocking so unrelated threads are not serialized behind slow independent work.', 'advanced', 3, 6230, true),
  ('cpp.concurrency.lock_granularity.reasoning_shared_ref_escape', 'bug_spotting', 'Do not return an unprotected reference', 'A read-heavy registry uses `std::shared_mutex`. `lookup()` takes a `std::shared_lock`, finds a `std::string` in an internal map, returns `const std::string&`, and then the lock is destroyed as the function returns. Why is that dangerous?', 'The caller keeps a reference after the shared lock is gone, so a writer can mutate/erase/reallocate the underlying object concurrently. Return an owned copy/value, or return an object that also owns the lock/lifetime needed to keep the reference stable.', 'advanced', 4, 6240, true),
  ('cpp.concurrency.shared_state_design.reasoning_local_reduce', 'code_reading', 'Prefer local accumulation then combine', 'Four workers each process a disjoint chunk. Compare (A) every item locks one shared `total` and adds to it versus (B) each worker accumulates a local subtotal and the owner combines four subtotals after join. Why is B often the better design?', 'The local-reduction design confines mutable state to each worker during the hot loop, eliminating per-item lock contention. Only the small final combine step needs coordination, which is easier to reason about and usually scales better.', 'advanced', 3, 6250, true),
  ('cpp.concurrency.shared_state_design.reasoning_cross_thread_mutation', 'bug_spotting', 'Avoid threads reaching into each other''s state', 'Two worker objects expose mutable fields, and each worker directly edits the other worker''s fields whenever it needs to hand off work. The code accumulates several locks and lock-order rules. What redesign most directly reduces the synchronization problem?', 'Prefer clear ownership boundaries: send immutable/owned messages through a thread-safe queue or transfer values to the worker that owns the state. Reducing shared writable memory often removes entire classes of races and deadlocks instead of managing them with more locks.', 'advanced', 4, 6260, true)
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
  ('cpp.concurrency.threads.reasoning_join_trace', 'cpp.concurrency.threads', true),
  ('cpp.concurrency.threads.reasoning_dangling_capture', 'cpp.concurrency.threads', true),
  ('cpp.concurrency.data_races.reasoning_lost_update', 'cpp.concurrency.data_races', true),
  ('cpp.concurrency.data_races.reasoning_plain_flag', 'cpp.concurrency.data_races', true),
  ('cpp.concurrency.mutexes.reasoning_multi_field_invariant', 'cpp.concurrency.mutexes', true),
  ('cpp.concurrency.mutexes.reasoning_manual_unlock', 'cpp.concurrency.mutexes', true),
  ('cpp.concurrency.async.reasoning_exception_get', 'cpp.concurrency.async', true),
  ('cpp.concurrency.async.reasoning_default_policy', 'cpp.concurrency.async', true),
  ('cpp.concurrency.deadlock.reasoning_wait_cycle', 'cpp.concurrency.deadlock', true),
  ('cpp.concurrency.deadlock.reasoning_scoped_lock', 'cpp.concurrency.deadlock', true),
  ('cpp.concurrency.condition_variables.reasoning_predicate_trace', 'cpp.concurrency.condition_variables', true),
  ('cpp.concurrency.condition_variables.reasoning_shutdown_notify', 'cpp.concurrency.condition_variables', true),
  ('cpp.concurrency.atomics.reasoning_compound_check', 'cpp.concurrency.atomics', true),
  ('cpp.concurrency.atomics.reasoning_volatile_stop', 'cpp.concurrency.atomics', true),
  ('cpp.concurrency.jthread.reasoning_stop_trace', 'cpp.concurrency.jthread', true),
  ('cpp.concurrency.jthread.reasoning_blocked_wait', 'cpp.concurrency.jthread', true),
  ('cpp.concurrency.promise_future.reasoning_exception_channel', 'cpp.concurrency.promise_future', true),
  ('cpp.concurrency.promise_future.reasoning_get_twice', 'cpp.concurrency.promise_future', true),
  ('cpp.concurrency.task_selection.reasoning_io_concurrency', 'cpp.concurrency.task_selection', true),
  ('cpp.concurrency.task_selection.reasoning_detached_poller', 'cpp.concurrency.task_selection', true),
  ('cpp.concurrency.memory_ordering.reasoning_release_acquire', 'cpp.concurrency.memory_ordering', true),
  ('cpp.concurrency.memory_ordering.reasoning_relaxed_publish', 'cpp.concurrency.memory_ordering', true),
  ('cpp.concurrency.lock_granularity.reasoning_short_critical_section', 'cpp.concurrency.lock_granularity', true),
  ('cpp.concurrency.lock_granularity.reasoning_shared_ref_escape', 'cpp.concurrency.lock_granularity', true),
  ('cpp.concurrency.shared_state_design.reasoning_local_reduce', 'cpp.concurrency.shared_state_design', true),
  ('cpp.concurrency.shared_state_design.reasoning_cross_thread_mutation', 'cpp.concurrency.shared_state_design', true)
on conflict (learning_item_id, skill_id) do update
set is_primary = excluded.is_primary;

insert into public.learning_item_choices (id, learning_item_id, content, is_correct, order_index)
values
  ('cpp.concurrency.threads.reasoning_join_trace.a', 'cpp.concurrency.threads.reasoning_join_trace', 'Main continues only after T1 has finished, and the thread object is no longer joinable', true, 10),
  ('cpp.concurrency.threads.reasoning_join_trace.b', 'cpp.concurrency.threads.reasoning_join_trace', 'Main continues immediately while T1 keeps running in the background', false, 20),
  ('cpp.concurrency.threads.reasoning_join_trace.c', 'cpp.concurrency.threads.reasoning_join_trace', 'join() detaches T1 and transfers ownership to the operating system', false, 30),
  ('cpp.concurrency.threads.reasoning_join_trace.d', 'cpp.concurrency.threads.reasoning_join_trace', 'join() only waits until T1 starts, not until it finishes', false, 40),
  ('cpp.concurrency.threads.reasoning_dangling_capture.a', 'cpp.concurrency.threads.reasoning_dangling_capture', 'The lambda may use `label` after its lifetime ends; capture owned data or keep the object alive until join', true, 10),
  ('cpp.concurrency.threads.reasoning_dangling_capture.b', 'cpp.concurrency.threads.reasoning_dangling_capture', 'Returning a `std::thread` always copies its callable, so references become safe', false, 20),
  ('cpp.concurrency.threads.reasoning_dangling_capture.c', 'cpp.concurrency.threads.reasoning_dangling_capture', 'The only bug is that `label` should be declared `volatile`', false, 30),
  ('cpp.concurrency.threads.reasoning_dangling_capture.d', 'cpp.concurrency.threads.reasoning_dangling_capture', 'There is no bug because the thread object itself is returned by value', false, 40),
  ('cpp.concurrency.data_races.reasoning_lost_update.a', 'cpp.concurrency.data_races.reasoning_lost_update', 'The final value can be 1: both threads read 0 before either write, so one update is lost', true, 10),
  ('cpp.concurrency.data_races.reasoning_lost_update.b', 'cpp.concurrency.data_races.reasoning_lost_update', 'The final value must be 2 because `++` is always atomic', false, 20),
  ('cpp.concurrency.data_races.reasoning_lost_update.c', 'cpp.concurrency.data_races.reasoning_lost_update', 'The final value must be 0 because concurrent writes cancel each other', false, 30),
  ('cpp.concurrency.data_races.reasoning_lost_update.d', 'cpp.concurrency.data_races.reasoning_lost_update', 'The trace is safe because each thread performs only one increment', false, 40),
  ('cpp.concurrency.data_races.reasoning_plain_flag.a', 'cpp.concurrency.data_races.reasoning_plain_flag', 'The read and write of `ready` race; use an atomic or proper mutex-based synchronization', true, 10),
  ('cpp.concurrency.data_races.reasoning_plain_flag.b', 'cpp.concurrency.data_races.reasoning_plain_flag', 'The code is safe because `bool` reads and writes are always synchronized', false, 20),
  ('cpp.concurrency.data_races.reasoning_plain_flag.c', 'cpp.concurrency.data_races.reasoning_plain_flag', 'The code is safe as long as the writer starts first', false, 30),
  ('cpp.concurrency.data_races.reasoning_plain_flag.d', 'cpp.concurrency.data_races.reasoning_plain_flag', 'Only the writer needs a mutex; the reader can remain unsynchronized', false, 40),
  ('cpp.concurrency.mutexes.reasoning_multi_field_invariant.a', 'cpp.concurrency.mutexes.reasoning_multi_field_invariant', 'The lock protects only part of the invariant; `count` and `total` must be updated together under the same mutex', true, 10),
  ('cpp.concurrency.mutexes.reasoning_multi_field_invariant.b', 'cpp.concurrency.mutexes.reasoning_multi_field_invariant', 'The lock should protect only `total` because integer increments are automatically synchronized', false, 20),
  ('cpp.concurrency.mutexes.reasoning_multi_field_invariant.c', 'cpp.concurrency.mutexes.reasoning_multi_field_invariant', 'The code is safe because readers already hold the mutex', false, 30),
  ('cpp.concurrency.mutexes.reasoning_multi_field_invariant.d', 'cpp.concurrency.mutexes.reasoning_multi_field_invariant', 'The mutex should be replaced with `volatile` fields', false, 40),
  ('cpp.concurrency.mutexes.reasoning_manual_unlock.a', 'cpp.concurrency.mutexes.reasoning_manual_unlock', 'The early return can leave `m` locked; use an RAII lock guard', true, 10),
  ('cpp.concurrency.mutexes.reasoning_manual_unlock.b', 'cpp.concurrency.mutexes.reasoning_manual_unlock', 'The mutex unlocks automatically when the function returns even without a guard', false, 20),
  ('cpp.concurrency.mutexes.reasoning_manual_unlock.c', 'cpp.concurrency.mutexes.reasoning_manual_unlock', 'The only issue is that `valid` must be called after `update_shared_state`', false, 30),
  ('cpp.concurrency.mutexes.reasoning_manual_unlock.d', 'cpp.concurrency.mutexes.reasoning_manual_unlock', 'Manual locking is safer than RAII when a function has multiple returns', false, 40),
  ('cpp.concurrency.async.reasoning_exception_get.a', 'cpp.concurrency.async.reasoning_exception_get', '`f.get()` rethrows the worker exception in the calling thread', true, 10),
  ('cpp.concurrency.async.reasoning_exception_get.b', 'cpp.concurrency.async.reasoning_exception_get', 'The exception is silently discarded when the worker exits', false, 20),
  ('cpp.concurrency.async.reasoning_exception_get.c', 'cpp.concurrency.async.reasoning_exception_get', 'The exception is thrown when `std::async` returns the future', false, 30),
  ('cpp.concurrency.async.reasoning_exception_get.d', 'cpp.concurrency.async.reasoning_exception_get', 'The exception automatically terminates the entire process before `get()`', false, 40),
  ('cpp.concurrency.async.reasoning_default_policy.a', 'cpp.concurrency.async.reasoning_default_policy', 'The default policy may defer execution; use `std::launch::async` if eager background execution is required', true, 10),
  ('cpp.concurrency.async.reasoning_default_policy.b', 'cpp.concurrency.async.reasoning_default_policy', '`std::async` always creates exactly one operating-system thread immediately', false, 20),
  ('cpp.concurrency.async.reasoning_default_policy.c', 'cpp.concurrency.async.reasoning_default_policy', 'The future can be ignored because its destructor always executes the callable', false, 30),
  ('cpp.concurrency.async.reasoning_default_policy.d', 'cpp.concurrency.async.reasoning_default_policy', 'Adding `volatile` to the future forces eager execution', false, 40),
  ('cpp.concurrency.deadlock.reasoning_wait_cycle.a', 'cpp.concurrency.deadlock.reasoning_wait_cycle', 'Each thread waits for a lock held by the other, forming a circular wait', true, 10),
  ('cpp.concurrency.deadlock.reasoning_wait_cycle.b', 'cpp.concurrency.deadlock.reasoning_wait_cycle', 'The mutexes will automatically exchange owners after a timeout', false, 20),
  ('cpp.concurrency.deadlock.reasoning_wait_cycle.c', 'cpp.concurrency.deadlock.reasoning_wait_cycle', 'T1 will always win because it acquired its first mutex first', false, 30),
  ('cpp.concurrency.deadlock.reasoning_wait_cycle.d', 'cpp.concurrency.deadlock.reasoning_wait_cycle', 'The deadlock happens only if both mutexes are recursive', false, 40),
  ('cpp.concurrency.deadlock.reasoning_scoped_lock.a', 'cpp.concurrency.deadlock.reasoning_scoped_lock', 'Acquire both with `std::scoped_lock` (or enforce one global lock order everywhere)', true, 10),
  ('cpp.concurrency.deadlock.reasoning_scoped_lock.b', 'cpp.concurrency.deadlock.reasoning_scoped_lock', 'Insert a short delay between the first and second lock', false, 20),
  ('cpp.concurrency.deadlock.reasoning_scoped_lock.c', 'cpp.concurrency.deadlock.reasoning_scoped_lock', 'Use `try_lock` once and proceed even if the second lock fails', false, 30),
  ('cpp.concurrency.deadlock.reasoning_scoped_lock.d', 'cpp.concurrency.deadlock.reasoning_scoped_lock', 'Make both mutexes recursive without changing the order', false, 40),
  ('cpp.concurrency.condition_variables.reasoning_predicate_trace.a', 'cpp.concurrency.condition_variables.reasoning_predicate_trace', 'Re-acquire the mutex and confirm the predicate is true before proceeding', true, 10),
  ('cpp.concurrency.condition_variables.reasoning_predicate_trace.b', 'cpp.concurrency.condition_variables.reasoning_predicate_trace', 'Proceed immediately after any notification without checking state', false, 20),
  ('cpp.concurrency.condition_variables.reasoning_predicate_trace.c', 'cpp.concurrency.condition_variables.reasoning_predicate_trace', 'Keep the mutex locked for the entire time it is sleeping', false, 30),
  ('cpp.concurrency.condition_variables.reasoning_predicate_trace.d', 'cpp.concurrency.condition_variables.reasoning_predicate_trace', 'Convert `ready` to `volatile` so the predicate is unnecessary', false, 40),
  ('cpp.concurrency.condition_variables.reasoning_shutdown_notify.a', 'cpp.concurrency.condition_variables.reasoning_shutdown_notify', 'Only one waiter may wake; a global shutdown transition should wake all blocked consumers', true, 10),
  ('cpp.concurrency.condition_variables.reasoning_shutdown_notify.b', 'cpp.concurrency.condition_variables.reasoning_shutdown_notify', '`notify_one()` always wakes every waiter whose predicate is true', false, 20),
  ('cpp.concurrency.condition_variables.reasoning_shutdown_notify.c', 'cpp.concurrency.condition_variables.reasoning_shutdown_notify', 'Notifications must be sent before changing the protected state', false, 30),
  ('cpp.concurrency.condition_variables.reasoning_shutdown_notify.d', 'cpp.concurrency.condition_variables.reasoning_shutdown_notify', 'The waiters should stop checking a predicate during shutdown', false, 40),
  ('cpp.concurrency.atomics.reasoning_compound_check.a', 'cpp.concurrency.atomics.reasoning_compound_check', 'The load and decrement are separate atomic steps; two threads can both pass the check before either decrement', true, 10),
  ('cpp.concurrency.atomics.reasoning_compound_check.b', 'cpp.concurrency.atomics.reasoning_compound_check', '`std::atomic<int>` is not actually atomic on integer types', false, 20),
  ('cpp.concurrency.atomics.reasoning_compound_check.c', 'cpp.concurrency.atomics.reasoning_compound_check', '`fetch_sub` can randomly subtract more than one', false, 30),
  ('cpp.concurrency.atomics.reasoning_compound_check.d', 'cpp.concurrency.atomics.reasoning_compound_check', 'The invariant is guaranteed because every individual access is atomic', false, 40),
  ('cpp.concurrency.atomics.reasoning_volatile_stop.a', 'cpp.concurrency.atomics.reasoning_volatile_stop', '`volatile` is not thread synchronization; use an atomic flag or a higher-level cancellation primitive', true, 10),
  ('cpp.concurrency.atomics.reasoning_volatile_stop.b', 'cpp.concurrency.atomics.reasoning_volatile_stop', '`volatile` makes the flag fully equivalent to `std::atomic<bool>`', false, 20),
  ('cpp.concurrency.atomics.reasoning_volatile_stop.c', 'cpp.concurrency.atomics.reasoning_volatile_stop', 'The flag is safe because `bool` occupies only one byte', false, 30),
  ('cpp.concurrency.atomics.reasoning_volatile_stop.d', 'cpp.concurrency.atomics.reasoning_volatile_stop', 'The writer alone can add a mutex and leave the reader unchanged', false, 40),
  ('cpp.concurrency.jthread.reasoning_stop_trace.a', 'cpp.concurrency.jthread.reasoning_stop_trace', 'Cancellation is cooperative: the worker observes the stop request at a safe point and exits normally', true, 10),
  ('cpp.concurrency.jthread.reasoning_stop_trace.b', 'cpp.concurrency.jthread.reasoning_stop_trace', '`request_stop()` forcibly interrupts the worker at an arbitrary instruction', false, 20),
  ('cpp.concurrency.jthread.reasoning_stop_trace.c', 'cpp.concurrency.jthread.reasoning_stop_trace', 'The operating system destroys the worker stack immediately', false, 30),
  ('cpp.concurrency.jthread.reasoning_stop_trace.d', 'cpp.concurrency.jthread.reasoning_stop_trace', 'The token automatically throws an exception inside the worker', false, 40),
  ('cpp.concurrency.jthread.reasoning_blocked_wait.a', 'cpp.concurrency.jthread.reasoning_blocked_wait', 'The worker can remain blocked and never observe the stop request; the wait must also be cancellation-aware', true, 10),
  ('cpp.concurrency.jthread.reasoning_blocked_wait.b', 'cpp.concurrency.jthread.reasoning_blocked_wait', '`request_stop()` always interrupts every blocking library call automatically', false, 20),
  ('cpp.concurrency.jthread.reasoning_blocked_wait.c', 'cpp.concurrency.jthread.reasoning_blocked_wait', 'The worker should detach before waiting so cancellation can complete', false, 30),
  ('cpp.concurrency.jthread.reasoning_blocked_wait.d', 'cpp.concurrency.jthread.reasoning_blocked_wait', 'The fix is to ignore the stop token while the queue is empty', false, 40),
  ('cpp.concurrency.promise_future.reasoning_exception_channel.a', 'cpp.concurrency.promise_future.reasoning_exception_channel', '`future.get()` rethrows the stored exception in the consumer thread', true, 10),
  ('cpp.concurrency.promise_future.reasoning_exception_channel.b', 'cpp.concurrency.promise_future.reasoning_exception_channel', 'The exception is converted into a default-constructed result value', false, 20),
  ('cpp.concurrency.promise_future.reasoning_exception_channel.c', 'cpp.concurrency.promise_future.reasoning_exception_channel', 'The promise immediately throws the exception in every thread', false, 30),
  ('cpp.concurrency.promise_future.reasoning_exception_channel.d', 'cpp.concurrency.promise_future.reasoning_exception_channel', 'The exception is discarded once `set_exception` returns', false, 40),
  ('cpp.concurrency.promise_future.reasoning_get_twice.a', 'cpp.concurrency.promise_future.reasoning_get_twice', 'The second `get()` is invalid because a `std::future` result is consumed once; use `shared_future` for repeated access', true, 10),
  ('cpp.concurrency.promise_future.reasoning_get_twice.b', 'cpp.concurrency.promise_future.reasoning_get_twice', 'Both calls are guaranteed to return the same value', false, 20),
  ('cpp.concurrency.promise_future.reasoning_get_twice.c', 'cpp.concurrency.promise_future.reasoning_get_twice', 'The first call should be replaced with `wait()` because `get()` never blocks', false, 30),
  ('cpp.concurrency.promise_future.reasoning_get_twice.d', 'cpp.concurrency.promise_future.reasoning_get_twice', 'The future becomes reusable automatically after the producer thread joins', false, 40),
  ('cpp.concurrency.task_selection.reasoning_io_concurrency.a', 'cpp.concurrency.task_selection.reasoning_io_concurrency', 'Tasks can overlap waiting periods, so another request can progress while one is blocked on I/O', true, 10),
  ('cpp.concurrency.task_selection.reasoning_io_concurrency.b', 'cpp.concurrency.task_selection.reasoning_io_concurrency', 'Concurrency automatically creates more CPU cores', false, 20),
  ('cpp.concurrency.task_selection.reasoning_io_concurrency.c', 'cpp.concurrency.task_selection.reasoning_io_concurrency', 'Only parallel numeric code benefits from multiple tasks', false, 30),
  ('cpp.concurrency.task_selection.reasoning_io_concurrency.d', 'cpp.concurrency.task_selection.reasoning_io_concurrency', 'The only useful design is one detached thread per request', false, 40),
  ('cpp.concurrency.task_selection.reasoning_detached_poller.a', 'cpp.concurrency.task_selection.reasoning_detached_poller', 'Own the long-lived worker (for example with `std::jthread`) and give it a defined cancellation/join lifecycle', true, 10),
  ('cpp.concurrency.task_selection.reasoning_detached_poller.b', 'cpp.concurrency.task_selection.reasoning_detached_poller', 'Keep the detached thread and rely on the process to outlive every component', false, 20),
  ('cpp.concurrency.task_selection.reasoning_detached_poller.c', 'cpp.concurrency.task_selection.reasoning_detached_poller', 'Capture `this` by reference explicitly to make the lifetime safer', false, 30),
  ('cpp.concurrency.task_selection.reasoning_detached_poller.d', 'cpp.concurrency.task_selection.reasoning_detached_poller', 'Replace the thread with `volatile` state and no shutdown protocol', false, 40),
  ('cpp.concurrency.memory_ordering.reasoning_release_acquire.a', 'cpp.concurrency.memory_ordering.reasoning_release_acquire', 'The release store synchronizes with the acquire load that reads it, creating happens-before for the earlier data write', true, 10),
  ('cpp.concurrency.memory_ordering.reasoning_release_acquire.b', 'cpp.concurrency.memory_ordering.reasoning_release_acquire', 'Any atomic access automatically orders every unrelated memory access in the program', false, 20),
  ('cpp.concurrency.memory_ordering.reasoning_release_acquire.c', 'cpp.concurrency.memory_ordering.reasoning_release_acquire', 'The consumer is safe only because integer reads are one machine instruction', false, 30),
  ('cpp.concurrency.memory_ordering.reasoning_release_acquire.d', 'cpp.concurrency.memory_ordering.reasoning_release_acquire', 'The guarantee comes from the threads starting in producer-before-consumer order', false, 40),
  ('cpp.concurrency.memory_ordering.reasoning_relaxed_publish.a', 'cpp.concurrency.memory_ordering.reasoning_relaxed_publish', 'There is no happens-before edge publishing the payload; use release/acquire or a mutex', true, 10),
  ('cpp.concurrency.memory_ordering.reasoning_relaxed_publish.b', 'cpp.concurrency.memory_ordering.reasoning_relaxed_publish', 'Relaxed ordering is stronger than acquire/release for publication', false, 20),
  ('cpp.concurrency.memory_ordering.reasoning_relaxed_publish.c', 'cpp.concurrency.memory_ordering.reasoning_relaxed_publish', 'The payload becomes atomic because the flag is atomic', false, 30),
  ('cpp.concurrency.memory_ordering.reasoning_relaxed_publish.d', 'cpp.concurrency.memory_ordering.reasoning_relaxed_publish', 'A relaxed load guarantees visibility of every write made before thread creation', false, 40),
  ('cpp.concurrency.lock_granularity.reasoning_short_critical_section.a', 'cpp.concurrency.lock_granularity.reasoning_short_critical_section', 'Keep only the shared-state snapshot under the lock; do formatting and external I/O after unlocking', true, 10),
  ('cpp.concurrency.lock_granularity.reasoning_short_critical_section.b', 'cpp.concurrency.lock_granularity.reasoning_short_critical_section', 'Hold the lock through all formatting and I/O so no other thread can run', false, 20),
  ('cpp.concurrency.lock_granularity.reasoning_short_critical_section.c', 'cpp.concurrency.lock_granularity.reasoning_short_critical_section', 'Remove the lock because copying a record is always atomic', false, 30),
  ('cpp.concurrency.lock_granularity.reasoning_short_critical_section.d', 'cpp.concurrency.lock_granularity.reasoning_short_critical_section', 'Replace the mutex with a recursive mutex so the long critical section is faster', false, 40),
  ('cpp.concurrency.lock_granularity.reasoning_shared_ref_escape.a', 'cpp.concurrency.lock_granularity.reasoning_shared_ref_escape', 'The reference escapes after the shared lock is released; return owned data or keep protection alive with the reference', true, 10),
  ('cpp.concurrency.lock_granularity.reasoning_shared_ref_escape.b', 'cpp.concurrency.lock_granularity.reasoning_shared_ref_escape', 'A `shared_mutex` permanently freezes any object read through a shared lock', false, 20),
  ('cpp.concurrency.lock_granularity.reasoning_shared_ref_escape.c', 'cpp.concurrency.lock_granularity.reasoning_shared_ref_escape', 'References are automatically copied when a lock goes out of scope', false, 30),
  ('cpp.concurrency.lock_granularity.reasoning_shared_ref_escape.d', 'cpp.concurrency.lock_granularity.reasoning_shared_ref_escape', 'The only problem is that writers should also use `shared_lock`', false, 40),
  ('cpp.concurrency.shared_state_design.reasoning_local_reduce.a', 'cpp.concurrency.shared_state_design.reasoning_local_reduce', 'Each worker mutates only local state during the hot loop, reducing contention and synchronization surface', true, 10),
  ('cpp.concurrency.shared_state_design.reasoning_local_reduce.b', 'cpp.concurrency.shared_state_design.reasoning_local_reduce', 'Local variables are automatically atomic across threads', false, 20),
  ('cpp.concurrency.shared_state_design.reasoning_local_reduce.c', 'cpp.concurrency.shared_state_design.reasoning_local_reduce', 'The final combine step is unnecessary because the subtotals merge themselves', false, 30),
  ('cpp.concurrency.shared_state_design.reasoning_local_reduce.d', 'cpp.concurrency.shared_state_design.reasoning_local_reduce', 'A shared locked counter is always faster because it uses only one variable', false, 40),
  ('cpp.concurrency.shared_state_design.reasoning_cross_thread_mutation.a', 'cpp.concurrency.shared_state_design.reasoning_cross_thread_mutation', 'Give each worker ownership of its own state and communicate with owned/immutable messages through a synchronized channel', true, 10),
  ('cpp.concurrency.shared_state_design.reasoning_cross_thread_mutation.b', 'cpp.concurrency.shared_state_design.reasoning_cross_thread_mutation', 'Expose even more fields so each worker can update the other without helper functions', false, 20),
  ('cpp.concurrency.shared_state_design.reasoning_cross_thread_mutation.c', 'cpp.concurrency.shared_state_design.reasoning_cross_thread_mutation', 'Replace every mutex with `volatile` fields', false, 30),
  ('cpp.concurrency.shared_state_design.reasoning_cross_thread_mutation.d', 'cpp.concurrency.shared_state_design.reasoning_cross_thread_mutation', 'Keep direct cross-thread mutation but add arbitrary lock retries', false, 40)
on conflict (id) do update
set
  learning_item_id = excluded.learning_item_id,
  content = excluded.content,
  is_correct = excluded.is_correct,
  order_index = excluded.order_index;
