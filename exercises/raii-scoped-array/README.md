# RAII: a move-only scoped array

**Skills:** resource lifetime, destructor cleanup, move semantics
· **Difficulty:** intermediate · **~30 min**

Implement `ScopedArray`, a class that owns a heap-allocated `int` array and
manages it with RAII.

## Requirements

- The constructor allocates `size` ints, value-initialized to `0`.
- The destructor frees the memory exactly once.
- The type is **move-only**: copying is deleted; moving transfers ownership and
  leaves the moved-from object empty (`size() == 0`, owns no memory).
- `live()` returns how many `ScopedArray` objects currently own memory; it must
  return to its prior value after every `ScopedArray` in a scope is destroyed.

Edit only `scoped_array.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
# Prepare a working copy of the starter:
scripts/exercises/prepare.sh raii-scoped-array
# ...edit exercises/raii-scoped-array/work/scoped_array.hpp...

# Build (with address/UB sanitizers) and run the tests:
scripts/exercises/test.sh raii-scoped-array

# Start over from the starter:
scripts/exercises/reset.sh raii-scoped-array
```

When all three tests pass, mark the exercise complete in cppFan (this records a
`write_code_completed` event for the linked skills — it does not auto-grant
mastery).
