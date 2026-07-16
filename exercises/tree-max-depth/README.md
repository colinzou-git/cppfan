# Binary tree: maximum depth

Return the maximum depth of a binary tree, measured in **nodes** along the
longest root-to-leaf path. An empty tree has depth 0; a single node has depth 1.

Implement `max_depth` in `max_depth.hpp`:

```cpp
int max_depth(TreeNode* root);
```

Approach:
- Base case: a null node contributes `0`.
- Recursive case: `1 + max(max_depth(left), max_depth(right))`.

Examples: a full three-level tree → `3`; a single node → `1`; empty → `0`.

Only edit `max_depth.hpp`. Do not change the interface or the tests.
