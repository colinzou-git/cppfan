// Exercise: dp-word-break
// Given a string `s` and a dictionary of words, return whether `s` can be
// segmented into a sequence of one or more dictionary words. Words may be reused.
//
// Rules:
//  - `word_break(s, dict)` returns true iff s splits fully into dictionary words.
//  - Let dp[i] mean "s[0..i) is segmentable"; dp[0] = true.
//  - dp[i] is true when some j < i has dp[j] true and s[j..i) in the dictionary.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>
#include <vector>

inline bool word_break(const std::string& s, const std::vector<std::string>& dict) {
  // TODO: build the dp array over prefixes of s and return dp[s.size()].
  (void)s;
  (void)dict;
  return false;
}
