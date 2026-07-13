# Concurrency: atomic counter

**Skills:** atomics, threads, data races
· **Difficulty:** intermediate · **~25 min**

Increment a shared counter from many threads without losing updates.

## Requirements

- Spawn `num_threads` threads; each increments a **shared** counter
  `per_thread` times.
- Join all threads, then return the final value.
- Use `std::atomic` so concurrent increments cannot race — the result must be
  exactly `num_threads * per_thread` every time.
- `num_threads == 0` returns 0.

Edit only `atomic_counter.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh concurrency-atomic-counter
# ...edit exercises/concurrency-atomic-counter/work/atomic_counter.hpp...
scripts/exercises/test.sh concurrency-atomic-counter
scripts/exercises/reset.sh concurrency-atomic-counter
```

When all tests pass, mark the exercise complete in cppFan.
