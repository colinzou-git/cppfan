# Graphs: course schedule

**Skills:** topological sort, cycle detection, graph representation
· **Difficulty:** intermediate · **~35 min**

Decide whether every course can be finished given prerequisite constraints.

## Requirements

- Courses are `0..num_courses-1`.
- Each pair `{a, b}` means course `b` must be taken before course `a`.
- Return `true` iff there is **no** cyclic dependency (all courses finishable).
- Kahn's algorithm (BFS topological sort) or DFS cycle detection both work.

Edit only `course_schedule.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh graph-course-schedule
# ...edit exercises/graph-course-schedule/work/course_schedule.hpp...
scripts/exercises/test.sh graph-course-schedule
scripts/exercises/reset.sh graph-course-schedule
```

When all tests pass, mark the exercise complete in cppFan.
