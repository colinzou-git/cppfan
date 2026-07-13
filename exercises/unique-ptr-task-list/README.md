# Smart pointers: unique_ptr task list

**Skills:** unique_ptr, ownership transfer, ownership choice
· **Difficulty:** intermediate · **~30 min**

A task list that **owns** its tasks through `std::unique_ptr`.

## Requirements

- `add(id, title)` — create a `Task` owned by the list (`std::make_unique`).
- `size()` — number of tasks.
- `find(id)` — return a **non-owning** `const Task*` (nullptr if absent).
- `remove(id)` — destroy the task; return whether it was found.
- `take(id)` — **transfer** ownership out as a `std::unique_ptr<Task>` (nullptr if
  absent); the task is no longer in the list.

Store tasks in a `std::vector<std::unique_ptr<Task>>`. Tests run under
AddressSanitizer.

Edit only `task_list.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh unique-ptr-task-list
# ...edit exercises/unique-ptr-task-list/work/task_list.hpp...
scripts/exercises/test.sh unique-ptr-task-list
scripts/exercises/reset.sh unique-ptr-task-list
```

When all tests pass, mark the exercise complete in cppFan.
