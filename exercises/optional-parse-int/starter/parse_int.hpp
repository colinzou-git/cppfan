// Exercise: optional-parse-int
// Parse a whole string as an int, returning std::optional<int>.
//
// Rules:
//  - Return the value only when the ENTIRE string is a valid int.
//  - Return std::nullopt for: empty input, non-digit characters, surrounding
//    whitespace, or a value that overflows int.
//  - A single leading '+' is allowed (e.g. "+3"); '-' is allowed for negatives.
//
// std::from_chars is the clean tool: it reports both an error code and how far
// it parsed (so you can require it consumed the whole string).
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <charconv>
#include <optional>
#include <string>

inline std::optional<int> parse_int(const std::string& s) {
  // TODO: use std::from_chars and require it consumed the entire string with no
  // error; handle empty input and a leading '+'.
  (void)s;
  return std::nullopt;
}
