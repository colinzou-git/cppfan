// Exercise: variant-json-token
// Inspect a JSON scalar token stored in a std::variant, using std::visit.
//
// The token type is fixed for you:
//   JsonToken = variant<nullptr_t, bool, double, string>
//
// Implement:
//  - kind(token): "null", "boolean", "number", or "string".
//  - truthy(token): JSON-ish truthiness — null->false, bool->itself,
//    number->(value != 0), string->(non-empty).
//
// Use std::visit with a generic lambda and `if constexpr` on the alternative type.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <cstddef>
#include <string>
#include <type_traits>
#include <variant>

using JsonToken = std::variant<std::nullptr_t, bool, double, std::string>;

inline std::string kind(const JsonToken& token) {
  // TODO: visit and return the alternative's kind name.
  (void)token;
  return "";
}

inline bool truthy(const JsonToken& token) {
  // TODO: visit and return JSON-ish truthiness.
  (void)token;
  return false;
}
