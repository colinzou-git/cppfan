# Linked list: remove the nth node from the end

Implement `remove_nth(head, n)`: remove the `n`th node counting from the **end**
of the list (1-based) and return the new head. Delete the removed node.

## Approach

1. Put a **dummy node** before the head so deleting the first real node is not a
   special case.
2. Advance a `lead` pointer `n` steps ahead.
3. Move `lead` and a `trail` pointer together until `lead` reaches the last node.
   `trail` now sits just before the target.
4. Splice out `trail->next` and `delete` it.

`1 <= n <= length`.

## Examples

| List | n | Output |
|---|---|---|
| `1 → 2 → 3 → 4 → 5` | `2` | `1 → 2 → 3 → 5` |
| `1 → 2 → 3` | `3` | `2 → 3` |
| `1 → 2 → 3 → 4 → 5` | `1` | `1 → 2 → 3 → 4` |
| `42` | `1` | *(empty)* |

## Files

- `starter/remove_nth.hpp` — implement here.
- `tests/tests.cpp` — the checks your solution must pass.
