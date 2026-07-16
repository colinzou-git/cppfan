# Backtracking: generate parentheses

Return every combination of `n` pairs of **well-formed** parentheses, sorted.

Implement `generate_parentheses` in `generate_parentheses.hpp`:

```cpp
std::vector<std::string> generate_parentheses(int n);
```

Approach:
- Track how many `(` and `)` you have placed so far. Add `(` while the open
  count is below `n`; add `)` only while `close < open` (so it never becomes
  unbalanced).
- The base case is a string of length `2*n` — every string built under those
  rules is valid; record a copy.
- Sort the result at the end for a stable order.

Examples: `generate_parentheses(2)` → `{"(())","()()"}`; `generate_parentheses(3)`
has 5 combinations (the 3rd Catalan number).

Only edit `generate_parentheses.hpp`. Do not change the interface or the tests.
