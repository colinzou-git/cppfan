// Exercise: strings-longest-common-prefix
// Return the longest prefix shared by every string in `words` ("" if none).
//
// Rules:
//  - The result is at most as long as the shortest word.
//  - An empty list, or a first-character mismatch, gives "".
//  - Compare position by position across all words; stop at the first mismatch.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>
#include <vector>

inline std::string longest_common_prefix(const std::vector<std::string>& words) {
  // TODO: walk character positions of words[0], checking every other word;
  // return words[0].substr(0, matched) at the first mismatch or end.
  (void)words;
  return "";
}
