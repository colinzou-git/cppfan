# Concurrency: promise/future results and exceptions

Run independent square jobs in worker threads using std::promise and std::future. A negative input throws std::invalid_argument inside the worker; propagate the exception through the future and render that result as 'error'. Retrieve each future exactly once.

## Task

Edit `promise_jobs.hpp` in the work directory. Preserve the public interface and use C++20 synchronization. Reference code must never rely on `sleep_for` to establish correctness.

1. Create one promise and future per job before launching the workers.
2. Catch inside the worker and call set_exception(std::current_exception()).
3. Join workers and call future::get exactly once per job, catching exceptions at the receiving end.

## Local test commands

```bash
scripts/exercises/prepare.sh concurrency-promise-future-errors
scripts/exercises/test.sh concurrency-promise-future-errors
```

## In-app Code Lab

Open `/lab/concurrency-promise-future-errors`. The web editor is a self-contained stdin/stdout adaptation of this exercise. The local package includes additional concurrent invariants, which are checked with a real compiler.
