# Concurrency: repair shared statistics

Compute the element count and sum in parallel. Each worker first accumulates locally and then updates both shared statistics inside one mutex-protected critical section. Input worker count <= 0 means no workers and zero statistics.

## Task

Edit `concurrent_stats.hpp` in the work directory. Preserve the public interface and use C++20 synchronization. Reference code must never rely on `sleep_for` to establish correctness.

1. Split indices across workers so every input element is visited once.
2. Keep per-thread count and sum local; lock once to update the shared pair.
3. Join all threads before reading the final statistics.

## Local test commands

```bash
scripts/exercises/prepare.sh concurrency-data-race-repair
scripts/exercises/test.sh concurrency-data-race-repair
```

## In-app Code Lab

Open `/lab/concurrency-data-race-repair`. The web editor is a self-contained stdin/stdout adaptation of this exercise. The local package includes additional concurrent invariants, which are checked with a real compiler.
