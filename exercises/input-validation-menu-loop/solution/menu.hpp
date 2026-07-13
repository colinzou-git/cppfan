// Reference solution for input-validation-menu-loop.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <charconv>
#include <string>
#include <vector>

// Return the first input that is a valid menu choice: an integer in [1, 4] that
// occupies the whole token. Invalid entries are skipped; -1 if none is valid.
inline int first_valid_choice(const std::vector<std::string>& inputs) {
  for (const std::string& token : inputs) {
    if (token.empty()) {
      continue;
    }
    int value = 0;
    const char* begin = token.data();
    const char* end = token.data() + token.size();
    const auto [ptr, ec] = std::from_chars(begin, end, value);
    if (ec == std::errc() && ptr == end && value >= 1 && value <= 4) {
      return value;
    }
  }
  return -1;
}
