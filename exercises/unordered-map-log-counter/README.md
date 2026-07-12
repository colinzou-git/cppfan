# STL: event log counter

**Skills:** hash maps, STL algorithms, hashing
· **Difficulty:** beginner · **~25 min**

Tally event names in a hash map and answer simple frequency questions.

## Requirements

- `record(event)` — increment that event's tally.
- `count(event)` — how many times it was recorded (0 if never).
- `distinct()` — number of different event names seen.
- `most_frequent()` — the event with the highest tally; break ties by the
  lexicographically smallest name. Return `""` when nothing was recorded.

Edit only `log_counter.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh unordered-map-log-counter
# ...edit exercises/unordered-map-log-counter/work/log_counter.hpp...
scripts/exercises/test.sh unordered-map-log-counter
scripts/exercises/reset.sh unordered-map-log-counter
```

When all tests pass, mark the exercise complete in cppFan.
