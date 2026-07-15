# Bit manipulation: the single number

Every value in the input array appears **exactly twice**, except one value that
appears **once**. Return that single value.

Implement `single_number` in `single_number.hpp`:

```cpp
int single_number(const std::vector<int>& nums);
```

Rules:
- Exactly one element appears once; every other element appears exactly twice.
- Aim for O(n) time and O(1) extra space — no hash set needed.
- The classic trick uses XOR: `x ^ x == 0` and `x ^ 0 == x`, so XOR-ing the whole
  array cancels the paired values and leaves the unique one.

Only edit `single_number.hpp`. Do not change the interface or the tests.
