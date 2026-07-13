# Arrays: product except self

**Skills:** prefix/suffix products, array traversal, Big-O
· **Difficulty:** intermediate · **~25 min**

For each index, compute the product of all *other* elements — without division.

## Requirements

- `result[i]` = product of every `nums[j]` where `j != i`.
- Do **not** use division.
- Run in O(n) using running prefix and suffix products.
- An empty vector returns an empty vector; results use `long long`.

Edit only `product_except_self.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh array-product-except-self
# ...edit exercises/array-product-except-self/work/product_except_self.hpp...
scripts/exercises/test.sh array-product-except-self
scripts/exercises/reset.sh array-product-except-self
```

When all tests pass, mark the exercise complete in cppFan.
