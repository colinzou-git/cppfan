# Concurrency: cooperative jthread shutdown

Start n std::jthread workers that wait using a stop_token-aware condition_variable_any. Request cooperative stop for every worker, join them, and count exactly one acknowledged stop per worker. No detached threads or timing sleeps.

## Task

Edit `cooperative_stop.hpp` in the work directory. Preserve the public interface and use C++20 synchronization. Reference code must never rely on `sleep_for` to establish correctness.

1. Use std::jthread and accept std::stop_token in its callable.
2. condition_variable_any.wait(lock, stop_token, predicate) can unblock on a stop request.
3. Request stop for all workers, then join all before reading the atomic acknowledgment count.

## Local test commands

```bash
scripts/exercises/prepare.sh concurrency-jthread-cancellation
scripts/exercises/test.sh concurrency-jthread-cancellation
```

## In-app Code Lab

Open `/lab/concurrency-jthread-cancellation`. The web editor is a self-contained stdin/stdout adaptation of this exercise. The local package includes additional concurrent invariants, which are checked with a real compiler.
