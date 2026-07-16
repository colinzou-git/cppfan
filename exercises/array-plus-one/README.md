# Arrays: plus one

The input is a non-negative integer stored **one decimal digit per element**,
most significant digit first — e.g. `{1, 2, 9}` represents `129`. Return the
digits of that number **plus one** — e.g. `{1, 3, 0}`.

Implement `plus_one` in `plus_one.hpp`:

```cpp
std::vector<int> plus_one(std::vector<int> digits);
```

Approach:
- Walk from the least significant digit (last index) toward the most significant.
- Add one to the last digit; while a digit becomes `10`, set it to `0` and carry
  into the next digit to the left.
- If a carry survives past the first digit (the number was all nines), insert a
  `1` at the front.

Examples: `{1,2,9}` → `{1,3,0}`; `{9,9,9}` → `{1,0,0,0}`.

Only edit `plus_one.hpp`. Do not change the interface or the tests.
