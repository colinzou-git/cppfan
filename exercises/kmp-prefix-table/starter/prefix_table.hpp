// Exercise: kmp-prefix-table
// Build the KMP prefix function (a.k.a. failure function / lps array).
//
// Definition:
//  - lps[i] = the length of the longest PROPER prefix of s[0..i] that is also a
//    suffix of s[0..i]. "Proper" means it is not the whole substring.
//  - lps has the same length as s; lps[0] is always 0. An empty string -> {}.
//
// Examples:
//  - "aaaa"   -> {0, 1, 2, 3}
//  - "abcabc" -> {0, 0, 0, 1, 2, 3}
//  - "abacaba"-> {0, 0, 1, 0, 1, 2, 3}
//
// The classic O(n) build keeps a running length k and falls back via lps.
//
// Only edit this file. Do not change the public interface or the tests.
#pragma once

#include <string>
#include <vector>

inline std::vector<int> prefix_function(const std::string& s) {
  std::vector<int> lps(s.size(), 0);
  // TODO: for each i from 1, extend or fall back k = lps[k-1] until s[i] matches
  // s[k] (or k hits 0), then set lps[i] = k.
  return lps;
}
