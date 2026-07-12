# Constructors: a student record

**Skills:** parameterized constructor, member initializer list, default constructor
· **Difficulty:** beginner · **~25 min**

Practice a default constructor and a parameterized constructor that uses a
member initializer list and enforces simple validation.

## Requirements

- `Student()` default-constructs: name `""`, id `0`, gpa `0.0`.
- `Student(name, id, gpa)` initializes members via an **initializer list**:
  a negative id becomes `0`; gpa is clamped into `[0.0, 4.0]`.
- `name()`, `id()`, `gpa()` are const getters.
- `is_honor_roll()` is const and true when `gpa >= 3.5`.

Edit only `student.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh constructors-student-record
# ...edit exercises/constructors-student-record/work/student.hpp...
scripts/exercises/test.sh constructors-student-record
scripts/exercises/reset.sh constructors-student-record
```

When all tests pass, mark the exercise complete in cppFan.
