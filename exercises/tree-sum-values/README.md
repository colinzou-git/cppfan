# Binary tree: sum of values

Return the **sum of all node values** in a binary tree. An empty tree sums to 0.

Implement `tree_sum` in `tree_sum.hpp`:

```cpp
int tree_sum(TreeNode* root);
```

Approach:
- Base case: a null node contributes `0`.
- Recursive case: `root->val + tree_sum(root->left) + tree_sum(root->right)`.

Example: the full tree `1,2,3,4,5,6,7` sums to `28`.

Only edit `tree_sum.hpp`. Do not change the interface or the tests.
