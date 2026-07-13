# Trees: diameter

**Skills:** tree diameter, traversal, pointers
· **Difficulty:** intermediate · **~30 min**

Compute the diameter of a binary tree.

## Requirements

- The diameter is the number of **edges** on the longest path between any two
  nodes (the path need not pass through the root).
- An empty tree and a single node both have diameter 0.
- Do it in one DFS: return each subtree's height while tracking the best
  `left_height + right_height` seen at any node.

Edit only `tree_diameter.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh tree-diameter
# ...edit exercises/tree-diameter/work/tree_diameter.hpp...
scripts/exercises/test.sh tree-diameter
scripts/exercises/reset.sh tree-diameter
```

When all tests pass, mark the exercise complete in cppFan.
