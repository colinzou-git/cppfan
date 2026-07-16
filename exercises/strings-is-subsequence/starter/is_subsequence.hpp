// Exercise: strings-is-subsequence
// Return whether string s is a subsequence of string t: s can be formed by
// deleting zero or more characters of t WITHOUT reordering the rest.
//
// Rules:
//  - `is_subsequence(s, t)` returns true iff s is a subsequence of t.
//  - The empty string is a subsequence of everything.
//  - Two pointers: scan t; advance the s pointer on each match; s matched fully
//    means it is a subsequence.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>

inline bool is_subsequence(const std::string& s, const std::string& t) {
  // TODO: two-pointer scan of t, advancing through s on each match.
  (void)s;
  (void)t;
  return false;
}
