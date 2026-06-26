# DSA: count set bits

**Skills:** bit manipulation
· **Difficulty:** beginner · **~15 min**

Count the number of 1 bits in an unsigned integer (its Hamming weight) — a bit-twiddling warm-up.

## Requirements

- `count_set_bits(n)` returns how many bits are set to 1 in `n`.
- `count_set_bits(0)` is 0; `count_set_bits(0xFFFFFFFF)` is 32.
- Use bit operations (no string conversion). Brian Kernighan's trick
  (`n &= n - 1`) clears the lowest set bit each step.

Edit only `count_bits.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh dsa-count-set-bits
# edit exercises/dsa-count-set-bits/work/count_bits.hpp
scripts/exercises/test.sh dsa-count-set-bits
```

Or solve it in-app at `/lab/dsa-count-set-bits`.
