# Concurrency: deadlock-safe account transfers

Transfer funds between two accounts protected by independent mutexes. Validate amount and funds while holding BOTH account locks with std::scoped_lock, avoiding opposite-direction deadlock. Self-transfer of any nonnegative amount is a no-op success; negative transfers always fail.

## Task

Edit `safe_transfer.hpp` in the work directory. Preserve the public interface and use C++20 synchronization. Reference code must never rely on `sleep_for` to establish correctness.

1. Reject negative amounts, and short-circuit transfers to the same object before locking.
2. Acquire both independent mutexes together using std::scoped_lock.
3. Check available funds and update both balances before releasing either lock.

## Local test commands

```bash
scripts/exercises/prepare.sh concurrency-deadlock-safe-transfer
scripts/exercises/test.sh concurrency-deadlock-safe-transfer
```

## In-app Code Lab

Open `/lab/concurrency-deadlock-safe-transfer`. The web editor is a self-contained stdin/stdout adaptation of this exercise. The local package includes additional concurrent invariants, which are checked with a real compiler.
