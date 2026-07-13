# Greedy: activity selection

**Skills:** greedy, interval scheduling, greedy correctness
· **Difficulty:** intermediate · **~25 min**

Select the largest set of non-overlapping activities.

## Requirements

- Each activity has a `start` and an `end`. Two activities are compatible when
  one starts at or after the other ends (touching intervals do **not** overlap).
- Return the maximum number of mutually compatible activities.
- Classic greedy: sort by end time, then keep taking the earliest-finishing
  compatible activity.

Edit only `activity_selection.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh greedy-activity-selection
# ...edit exercises/greedy-activity-selection/work/activity_selection.hpp...
scripts/exercises/test.sh greedy-activity-selection
scripts/exercises/reset.sh greedy-activity-selection
```

When all tests pass, mark the exercise complete in cppFan.
