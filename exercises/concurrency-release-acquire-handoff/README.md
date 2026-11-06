# Concurrency: release/acquire data publication

Publish a fully initialized vector from one thread to another. Producer writes the payload then stores true with memory_order_release; consumer waits on memory_order_acquire before reading. Join both threads before returning the observed copy. Teach why relaxed publication is insufficient.

## Task

Edit `release_acquire.hpp` in the work directory. Preserve the public interface and use C++20 synchronization. Reference code must never rely on `sleep_for` to establish correctness.

1. The payload is initially private to the producer; no consumer may access it before the flag.
2. Call ready.store(true, std::memory_order_release) only AFTER filling the payload.
3. The consumer loops until ready.load(std::memory_order_acquire) then reads; join both threads.

## Local test commands

```bash
scripts/exercises/prepare.sh concurrency-release-acquire-handoff
scripts/exercises/test.sh concurrency-release-acquire-handoff
```

## In-app Code Lab

Open `/lab/concurrency-release-acquire-handoff`. The web editor is a self-contained stdin/stdout adaptation of this exercise. The local package includes additional concurrent invariants, which are checked with a real compiler.
