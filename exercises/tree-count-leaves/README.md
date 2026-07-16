# Binary tree: count leaves

Return the number of **leaf** nodes in a binary tree. A leaf is a node with no
left **and** no right child.

Implement `count_leaves` in `count_leaves.hpp`:

```cpp
int count_leaves(TreeNode* root);
```

Approach:
- Base cases: `nullptr` → `0`; a node whose children are both null → `1`.
- Otherwise recurse: `count_leaves(left) + count_leaves(right)`.

Example: the full tree `1,2,3,4,5,6,7` has 4 leaves (`4,5,6,7`).

Only edit `count_leaves.hpp`. Do not change the interface or the tests.
