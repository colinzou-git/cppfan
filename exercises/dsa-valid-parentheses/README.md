# DSA: valid parentheses

**Skills:** stacks
· **Difficulty:** beginner · **~20 min**

Decide whether the brackets in a string are balanced and correctly nested — the
classic stack warm-up.

## Requirements

- `is_balanced(s)` returns `true` if every `(`, `[`, `{` is closed by the matching
  `)`, `]`, `}` in the correct order.
- Non-bracket characters are ignored (so `"a(b)c"` is balanced).
- The empty string is balanced. Use a stack; O(n) time.

Edit only `parentheses.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh dsa-valid-parentheses
# edit exercises/dsa-valid-parentheses/work/parentheses.hpp
scripts/exercises/test.sh dsa-valid-parentheses
```

Or solve it in-app at `/lab/dsa-valid-parentheses`.
