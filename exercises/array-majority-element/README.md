# Arrays: majority element

Return the **majority element** of an array — the value that appears **more than
`n/2`** times. It is guaranteed to exist.

Implement `majority_element` in `majority_element.hpp`:

```cpp
int majority_element(const std::vector<int>& nums);
```

Approach — Boyer-Moore voting (O(n) time, O(1) space):
- Keep a `candidate` and a `count`.
- For each value: if `count == 0`, adopt the current value as the candidate;
  then `count++` if it equals the candidate, else `count--`.
- The surviving candidate is the majority element.

Examples: `{3,2,3}` → `3`; `{2,2,1,1,1,2,2}` → `2`.

Only edit `majority_element.hpp`. Do not change the interface or the tests.
