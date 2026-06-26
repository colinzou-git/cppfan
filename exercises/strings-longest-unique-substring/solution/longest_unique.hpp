// Reference solution for strings-longest-unique-substring.
// Kept out of the learner-facing default path; do not reveal before completion.
#pragma once

#include <array>
#include <string>

inline int longest_unique_substring(const std::string& s) {
  std::array<int, 256> last_seen;
  last_seen.fill(-1);
  int best = 0;
  int start = 0;  // left edge of the current window
  for (int i = 0; i < static_cast<int>(s.size()); ++i) {
    const unsigned char c = static_cast<unsigned char>(s[i]);
    if (last_seen[c] >= start) {
      start = last_seen[c] + 1;
    }
    last_seen[c] = i;
    const int window = i - start + 1;
    if (window > best) best = window;
  }
  return best;
}
