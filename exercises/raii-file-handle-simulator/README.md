# RAII: file handle simulator

**Skills:** resource lifetime, destructor cleanup, ownership boundary
· **Difficulty:** intermediate · **~25 min**

Build a RAII handle that opens on construction and closes exactly once.

## Requirements

- The constructor "opens" the handle and increments a shared open counter.
- `close()` marks the handle closed and decrements the counter — but only the
  first time (idempotent).
- The destructor closes the handle (automatic cleanup at scope exit).
- `is_open()` / `name()` are observers; `open_count()` reports how many are open.
- A `FileHandle` is non-copyable (copying would double-close).

Edit only `file_handle.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh raii-file-handle-simulator
# ...edit exercises/raii-file-handle-simulator/work/file_handle.hpp...
scripts/exercises/test.sh raii-file-handle-simulator
scripts/exercises/reset.sh raii-file-handle-simulator
```

When all tests pass, mark the exercise complete in cppFan.
