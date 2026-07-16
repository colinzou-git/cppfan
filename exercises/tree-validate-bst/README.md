# Binary tree: validate a BST

Implement `is_valid_bst(root)`: return `true` iff the tree is a valid **binary
search tree** — for every node, all values in its left subtree are strictly
smaller and all values in its right subtree are strictly larger.

## Approach

A local parent/child comparison is **not** enough — a node deep in the tree
must respect bounds inherited from all its ancestors. Recurse with an open
interval `(low, high)`:

1. Every node's value must satisfy `low < val < high`.
2. The left child inherits `(low, val)` — the upper bound tightens.
3. The right child inherits `(val, high)` — the lower bound tightens.

Use a wide 64-bit range so `int` extremes still validate. Equal values are not
allowed (strict BST). An empty tree is valid.

## Examples

| Tree (level order) | Output | Why |
|---|---|---|
| `[2, 1, 3]` | `true` | proper BST |
| `[5, 1, 4, X, X, 3, 6]` | `false` | `4` is in `5`'s right subtree |
| `[10, 5, 15, X, X, 6, 20]` | `false` | `6` violates the bound from `10` |

## Files

- `starter/is_valid_bst.hpp` — implement here.
- `tests/tests.cpp` — the checks your solution must pass.
