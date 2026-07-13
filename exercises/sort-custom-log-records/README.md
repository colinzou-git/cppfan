# Sorting: custom multi-key comparator

**Skills:** comparators, STL algorithms, lambdas
· **Difficulty:** beginner · **~20 min**

Rank records with a custom multi-key comparator.

## Requirements

- Sort by `score` **descending** (higher score first).
- Break ties by `name` **ascending** (lexicographic).
- Records equal on both keys keep their original relative order (use a **stable**
  sort).

Edit only `sort_records.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh sort-custom-log-records
# ...edit exercises/sort-custom-log-records/work/sort_records.hpp...
scripts/exercises/test.sh sort-custom-log-records
scripts/exercises/reset.sh sort-custom-log-records
```

When all tests pass, mark the exercise complete in cppFan.
