# Stack: evaluate Reverse Polish Notation

Evaluate an arithmetic expression in **Reverse Polish Notation** (postfix). Tokens
are integer literals or one of the operators `+ - * /`.

Implement `evaluate_rpn` in `evaluate_rpn.hpp`:

```cpp
int evaluate_rpn(const std::vector<std::string>& tokens);
```

Approach:
- Scan left to right, pushing numbers onto a stack.
- On an operator, pop the top two values — the **first** popped is the right
  operand, the **second** popped is the left — apply the op, and push the result.
- Integer division truncates toward zero (C++ int division already does this).

Example: `["2","1","+","3","*"]` → `9` (i.e. `(2+1)*3`).

Only edit `evaluate_rpn.hpp`. Do not change the interface or the tests.
