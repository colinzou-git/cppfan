# Templates: generic clamp

**Skills:** function templates, template deduction, multiple type params
· **Difficulty:** beginner · **~20 min**

Write ONE function template that clamps any comparable type into a range.

## Requirements

- `clamp_value(value, lo, hi)` returns `lo` if `value < lo`, `hi` if
  `value > hi`, else `value`.
- It must be a template so it works for `int`, `double`, `char`, `std::string`, …
- Rely only on `operator<` (compare with `<`), so it works for any ordered type.
- Assume `lo <= hi`.

Edit only `generic_clamp.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh template-generic-clamp
# ...edit exercises/template-generic-clamp/work/generic_clamp.hpp...
scripts/exercises/test.sh template-generic-clamp
scripts/exercises/reset.sh template-generic-clamp
```

When all tests pass, mark the exercise complete in cppFan.
