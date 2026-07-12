# Pointers: safe find into a vector

**Skills:** pointers, non-owning pointers, avoiding dangling
· **Difficulty:** beginner · **~25 min**

Return non-owning pointers into a vector, or `nullptr` when there is no match.

## Requirements

- `find_first(values, target)` — const pointer to the first equal element, or `nullptr`.
- `find_first_mutable(values, target)` — same, but a non-const pointer so the
  caller can edit the element in place.
- `contains(values, target)` — true when a match exists.
- Return pointers **into** the caller's vector; never return the address of a
  local copy (that would dangle).

Edit only `safe_find.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh pointers-safe-find
# ...edit exercises/pointers-safe-find/work/safe_find.hpp...
scripts/exercises/test.sh pointers-safe-find
scripts/exercises/reset.sh pointers-safe-find
```

When all tests pass, mark the exercise complete in cppFan.
