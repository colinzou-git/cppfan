// Reference solution for variant-json-token.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <cstddef>
#include <string>
#include <type_traits>
#include <variant>

// A tiny JSON scalar token: null, boolean, number, or string.
using JsonToken = std::variant<std::nullptr_t, bool, double, std::string>;

// The token's kind name.
inline std::string kind(const JsonToken& token) {
  return std::visit(
      [](auto&& value) -> std::string {
        using T = std::decay_t<decltype(value)>;
        if constexpr (std::is_same_v<T, std::nullptr_t>) {
          return "null";
        } else if constexpr (std::is_same_v<T, bool>) {
          return "boolean";
        } else if constexpr (std::is_same_v<T, double>) {
          return "number";
        } else {
          return "string";
        }
      },
      token);
}

// JSON-ish truthiness: null -> false, bool -> itself, number -> nonzero,
// string -> non-empty.
inline bool truthy(const JsonToken& token) {
  return std::visit(
      [](auto&& value) -> bool {
        using T = std::decay_t<decltype(value)>;
        if constexpr (std::is_same_v<T, std::nullptr_t>) {
          return false;
        } else if constexpr (std::is_same_v<T, bool>) {
          return value;
        } else if constexpr (std::is_same_v<T, double>) {
          return value != 0.0;
        } else {
          return !value.empty();
        }
      },
      token);
}
