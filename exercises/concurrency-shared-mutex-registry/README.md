# Concurrency: shared-mutex read-heavy registry

Implement a key/value registry using std::shared_mutex: many concurrent readers may read; writes require exclusive access. Return copied values as std::optional<std::string> so no reference escapes the lock.

## Task

Edit `shared_registry.hpp` in the work directory. Preserve the public interface and use C++20 synchronization. Reference code must never rely on `sleep_for` to establish correctness.

1. Protect the map with a mutable std::shared_mutex.
2. Use std::unique_lock for put() and std::shared_lock for get() and size().
3. Return a copy of the found string (optional) rather than a reference that outlives the lock.

## Local test commands

```bash
scripts/exercises/prepare.sh concurrency-shared-mutex-registry
scripts/exercises/test.sh concurrency-shared-mutex-registry
```

## In-app Code Lab

Open `/lab/concurrency-shared-mutex-registry`. The web editor is a self-contained stdin/stdout adaptation of this exercise. The local package includes additional concurrent invariants, which are checked with a real compiler.
