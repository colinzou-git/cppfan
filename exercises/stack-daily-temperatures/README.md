# Stack: daily temperatures

Given daily temperatures, return an array where `answer[i]` is the number of days
to wait after day `i` for a strictly **warmer** day. If there is no future warmer
day, `answer[i]` is `0`.

Implement `daily_temperatures` in `daily_temperatures.hpp`:

```cpp
std::vector<int> daily_temperatures(const std::vector<int>& temps);
```

Approach — a monotonic stack of **indices** (O(n) total):
- Keep indices whose warmer day has not been found yet.
- When `temps[i]` is warmer than the temperature at the stack's top index, pop it
  and set `answer[popped] = i - popped`; repeat, then push `i`.

Example: `{73,74,75,71,69,72,76,73}` → `{1,1,4,2,1,1,0,0}`.

Only edit `daily_temperatures.hpp`. Do not change the interface or the tests.
