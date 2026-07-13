// Reference solution for optional-parse-int.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <charconv>
#include <optional>
#include <string>

// Parse the WHOLE string as an int. Returns nullopt on empty input, stray
// characters (including surrounding spaces), or overflow. A single leading '+'
// is allowed.
inline std::optional<int> parse_int(const std::string& s) {
  if (s.empty()) {
    return std::nullopt;
  }
  const char* begin = s.data();
  const char* end = s.data() + s.size();
  if (*begin == '+') {
    ++begin;
    if (begin == end) {
      return std::nullopt;
    }
  }
  int value = 0;
  const auto [ptr, ec] = std::from_chars(begin, end, value);
  if (ec != std::errc() || ptr != end) {
    return std::nullopt;
  }
  return value;
}
