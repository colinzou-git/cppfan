# Stack: next greater element

For each element, return the first element to its **right** that is strictly
greater, or `-1` if there is none.

Implement `next_greater` in `next_greater.hpp`:

```cpp
std::vector<int> next_greater(const std::vector<int>& nums);
```

Approach — a monotonic (decreasing) stack of **indices** (O(n)):
- Keep indices whose next-greater has not been found.
- When `nums[i]` exceeds the value at the stack top, pop it and record `nums[i]`
  as its answer; repeat, then push `i`.

Example: `{2,1,2,4,3}` → `{4,2,4,-1,-1}`.

Only edit `next_greater.hpp`. Do not change the interface or the tests.
