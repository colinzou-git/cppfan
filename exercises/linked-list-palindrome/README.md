# Linked list: palindrome check

Implement `is_palindrome(head)`: return `true` iff the singly linked list reads
the same forwards and backwards.

## Approaches

- **Simple (O(n) space):** copy the values into a vector, then compare with two
  pointers moving inward from both ends.
- **O(1) extra space:** find the middle with slow/fast pointers, reverse the
  second half, and compare it against the first half.

An empty list and a single node are palindromes.

## Examples

| List | Output |
|---|---|
| `1 → 2 → 2 → 1` | `true` |
| `1 → 2 → 3 → 2 → 1` | `true` |
| `1 → 2 → 3` | `false` |

## Files

- `starter/is_palindrome.hpp` — implement here.
- `tests/tests.cpp` — the checks your solution must pass.
