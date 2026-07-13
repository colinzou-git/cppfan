# Templates: fixed-size array

**Skills:** class templates, multiple type params, constexpr
· **Difficulty:** intermediate · **~25 min**

Implement a small fixed-size array **class** template.

## Requirements

- `FixedArray<T, N>` stores `N` elements of type `T`, value-initialized to `T{}`.
- `size()` returns `N` (make it `constexpr`).
- `operator[]` gives read and write access (const and non-const overloads).
- `fill(value)` sets every element to `value`.
- `sum()` returns the total of all elements (using `operator+` and `T{}` as zero).

Edit only `fixed_array.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh template-fixed-array
# ...edit exercises/template-fixed-array/work/fixed_array.hpp...
scripts/exercises/test.sh template-fixed-array
scripts/exercises/reset.sh template-fixed-array
```

When all tests pass, mark the exercise complete in cppFan.
