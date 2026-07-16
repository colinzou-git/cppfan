# Bit manipulation: the missing number

The input array holds **n distinct integers** drawn from the range `0..n`
(inclusive). Since there are `n` values across `n + 1` slots, exactly one value
in that range is **missing**. Return it.

Implement `missing_number` in `missing_number.hpp`:

```cpp
int missing_number(const std::vector<int>& nums);
```

Rules:
- Every value is distinct and in `0..n`; exactly one is absent.
- Aim for O(n) time and O(1) extra space — no hash set needed.
- The XOR trick works: `x ^ x == 0` and `x ^ 0 == x`, so XOR-ing every index
  `0..n` together with every array value cancels the pairs and leaves the gap.

Only edit `missing_number.hpp`. Do not change the interface or the tests.
