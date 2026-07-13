# Utilities: variant JSON token

**Skills:** std::variant, std::visit, if constexpr
· **Difficulty:** intermediate · **~30 min**

Inspect a JSON scalar token stored in a `std::variant`, using `std::visit`.

The token type is fixed:
`JsonToken = variant<nullptr_t, bool, double, string>`.

## Requirements

- `kind(token)` returns `"null"`, `"boolean"`, `"number"`, or `"string"`.
- `truthy(token)` returns JSON-ish truthiness: null→false, bool→itself,
  number→(value != 0), string→(non-empty).
- Use `std::visit` with a generic lambda and `if constexpr` on the alternative type.

Edit only `json_token.hpp`. Do not change the public interface or the tests.

## Work here (Codespace or local)

```bash
scripts/exercises/prepare.sh variant-json-token
# ...edit exercises/variant-json-token/work/json_token.hpp...
scripts/exercises/test.sh variant-json-token
scripts/exercises/reset.sh variant-json-token
```

When all tests pass, mark the exercise complete in cppFan.
