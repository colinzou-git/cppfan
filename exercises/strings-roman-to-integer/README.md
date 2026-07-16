# Strings: Roman numeral to integer

Convert a valid uppercase Roman numeral string to its integer value.

Implement `roman_to_integer` in `roman_to_integer.hpp`:

```cpp
int roman_to_integer(const std::string& s);
```

Rules:
- Symbol values: `I=1, V=5, X=10, L=50, C=100, D=500, M=1000`.
- Scan left to right and **add** each value, except when a smaller value sits
  directly before a larger one — then **subtract** it (`IV = 4`, `IX = 9`,
  `XL = 40`, `CM = 900`, ...).
- Decide add vs. subtract by comparing the current symbol's value with the
  **next** symbol's value.

Examples: `"LVIII"` → `58`; `"MCMXCIV"` → `1994`.

Only edit `roman_to_integer.hpp`. Do not change the interface or the tests.
