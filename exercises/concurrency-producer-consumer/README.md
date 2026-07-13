# Concurrency: producer/consumer

**Skills:** condition variables, mutexes, shared-state design
· **Difficulty:** advanced · **~45 min**

Coordinate producer and consumer threads through a shared queue.

## Requirements

- Start `producers` producer threads; each pushes the integers `1..items_each`
  into a shared queue.
- Start `consumers` consumer threads; each pops values and adds them to a shared
  total.
- Guard the queue with a mutex and use a `condition_variable` so consumers block
  (no busy-waiting) until work arrives or production finishes.
- Every produced value is consumed exactly once. Return the total, which must be
  deterministic: `producers * (items_each*(items_each+1)/2)`.
- Consumers must exit cleanly once the queue is drained **and** all producers are
  done (handle `producers == 0` without deadlocking).

Edit only `producer_consumer.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh concurrency-producer-consumer
# ...edit exercises/concurrency-producer-consumer/work/producer_consumer.hpp...
scripts/exercises/test.sh concurrency-producer-consumer
scripts/exercises/reset.sh concurrency-producer-consumer
```

When all tests pass, mark the exercise complete in cppFan.
