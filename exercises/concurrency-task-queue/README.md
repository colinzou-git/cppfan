# Concurrency: bounded task queue

**Skills:** threads, mutexes, condition variables, deadlock avoidance, shared-state design
**Difficulty:** advanced - **~45 min**

Implement a small bounded FIFO task queue. Producers call `push` to add work,
consumers call `pop` to wait for work, and `close` shuts the queue down cleanly.
The tests are deterministic: they use joins, promises, and exact-count
invariants rather than sleeps or timing assumptions.

## Requirements

- `push(task)` blocks while the queue is full, then enqueues the task and
  returns `true`.
- If the queue has been closed, `push(task)` returns `false` and does not enqueue
  the task.
- `pop()` blocks while the queue is empty and open.
- `pop()` returns the next task in FIFO order, or `std::nullopt` once the queue is
  closed and drained.
- `close()` marks the queue closed and wakes all waiting producers/consumers.
- Keep all shared state protected by a mutex; use `condition_variable::wait`
  predicates, not sleeps.

Edit only `bounded_task_queue.hpp`. Do not change the public interface or the
tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh concurrency-task-queue
# ...edit exercises/concurrency-task-queue/work/bounded_task_queue.hpp...
scripts/exercises/test.sh concurrency-task-queue
scripts/exercises/reset.sh concurrency-task-queue
```

When all tests pass, mark the exercise complete in cppFan.
