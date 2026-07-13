# Stack: O(1) minimum

**Skills:** stacks, container adapters, amortized analysis
· **Difficulty:** intermediate · **~25 min**

A LIFO stack that also reports its current minimum in O(1).

## Requirements

- `push(x)`, `pop()`, `top()`, `empty()`, `size()` behave like a normal stack.
- `get_min()` returns the smallest value currently on the stack, in O(1).
- `pop()`, `top()`, and `get_min()` are only called on a non-empty stack.

Hint: alongside the values, keep a parallel stack of "minimum so far".

Edit only `min_stack.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh stack-min-stack
# ...edit exercises/stack-min-stack/work/min_stack.hpp...
scripts/exercises/test.sh stack-min-stack
scripts/exercises/reset.sh stack-min-stack
```

When all tests pass, mark the exercise complete in cppFan.
