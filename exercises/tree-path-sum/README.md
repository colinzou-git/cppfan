# Binary tree: root-to-leaf path sum

Implement `has_path_sum(root, target)`: return `true` iff the tree has a
**root-to-leaf** path whose node values sum to exactly `target`.

## Approach

1. A leaf is a node with no children; only complete root-to-leaf paths count.
2. Descend the tree subtracting each node's value from the remaining target.
3. At a leaf, succeed when the remaining target equals the leaf's value.
4. An empty tree (`nullptr`) has no path — return `false`.

## Examples

For the tree

```
        5
       / \
      4   8
     /   / \
    11  13  4
   /  \
  7    2
```

| Target | Output | Path |
|---|---|---|
| `22` | `true` | `5 → 4 → 11 → 2` |
| `27` | `true` | `5 → 4 → 11 → 7` |
| `100` | `false` | — |

## Files

- `starter/has_path_sum.hpp` — implement here.
- `tests/tests.cpp` — the checks your solution must pass.
