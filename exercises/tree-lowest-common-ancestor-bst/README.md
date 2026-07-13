# Trees: lowest common ancestor in a BST

**Skills:** BST search, tree traversal, pointers
· **Difficulty:** intermediate · **~30 min**

Find the lowest common ancestor (LCA) of two values in a binary **search** tree.

## Requirements

- The tree is a BST (left subtree < node < right subtree).
- Return the node that is the deepest ancestor of both `p` and `q`.
- Exploit the BST ordering — no full traversal. O(height).
- Assume both `p` and `q` exist in the tree.

Edit only `lca_bst.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh tree-lowest-common-ancestor-bst
# ...edit exercises/tree-lowest-common-ancestor-bst/work/lca_bst.hpp...
scripts/exercises/test.sh tree-lowest-common-ancestor-bst
scripts/exercises/reset.sh tree-lowest-common-ancestor-bst
```

When all tests pass, mark the exercise complete in cppFan.
