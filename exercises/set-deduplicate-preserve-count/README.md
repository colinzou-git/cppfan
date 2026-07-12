# STL: deduplicate and count

**Skills:** std::set, STL algorithms, array traversal
· **Difficulty:** beginner · **~20 min**

Deduplicate a list of ints while reporting how many duplicates were removed.

## Requirements

- `sorted_unique` holds each distinct value once, in ascending order.
- `distinct` is the number of distinct values.
- `duplicates_removed` is `values.size() - distinct`.
- An empty input yields `{0, 0, {}}`.

A `std::set` gives you sorted, de-duplicated keys for free.

Edit only `dedupe.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh set-deduplicate-preserve-count
# ...edit exercises/set-deduplicate-preserve-count/work/dedupe.hpp...
scripts/exercises/test.sh set-deduplicate-preserve-count
scripts/exercises/reset.sh set-deduplicate-preserve-count
```

When all tests pass, mark the exercise complete in cppFan.
